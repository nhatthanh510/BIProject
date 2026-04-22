"""Seed realistic German B2B mock data for the Cube BI dashboard.

Usage:
    python manage.py seed_mock_data
    python manage.py seed_mock_data --flush
    python manage.py seed_mock_data --clients 8 --months 13
"""
import random
from datetime import date, datetime, time, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from clients.models import Client
from orders.models import Order
from tokens_usage.models import TokenQuota

User = get_user_model()

GERMAN_CLIENT_NAMES = [
    "Muster GmbH",
    "Bayer Logistik AG",
    "Nordsee Versicherung",
    "Alpen Treuhand",
    "Rheinland Kanzlei",
    "Hamburg Handel KG",
    "Schwarzwald Consulting",
    "Berlin Digital GmbH",
    "Frankfurt Finanz AG",
    "Köln Immobilien GmbH",
]

DOCUMENT_TYPES = ["Rechnung", "Vertrag", "Lieferschein", "Angebot", "Mahnung"]
STATUS_CHOICES = [
    (Order.Status.COMPLETED, 0.85),
    (Order.Status.PROCESSING, 0.10),
    (Order.Status.PENDING, 0.03),
    (Order.Status.FAILED, 0.02),
]
QUOTA_TIERS = [60_000, 120_000, 250_000, 500_000]


def weighted_choice(choices: list[tuple[str, float]]) -> str:
    r = random.random()
    cumulative = 0.0
    for value, weight in choices:
        cumulative += weight
        if r <= cumulative:
            return value
    return choices[-1][0]


def random_datetime_on(day: date) -> datetime:
    # Working-hours bias: 60% of orders 8:00-18:00
    if random.random() < 0.6:
        hour = random.randint(8, 17)
    else:
        hour = random.randint(0, 23)
    naive = datetime.combine(day, time(hour=hour, minute=random.randint(0, 59), second=random.randint(0, 59)))
    tz = timezone.get_current_timezone()
    return timezone.make_aware(naive, tz)


class Command(BaseCommand):
    help = "Seed the database with mock clients, orders and token quotas."

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true", help="Delete existing data first")
        parser.add_argument("--clients", type=int, default=8)
        parser.add_argument("--months", type=int, default=13, help="Includes current month")
        parser.add_argument("--admin-email", default="admin@cube-bi.local")
        parser.add_argument("--admin-password", default="admin123")
        parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")

    def handle(self, *args, **opts):
        random.seed(opts["seed"])
        self._seed(**opts)

    @transaction.atomic
    def _seed(self, *, flush, clients, months, admin_email, admin_password, seed, **_):
        if flush:
            self.stdout.write("Flushing existing orders, quotas, clients...")
            Order.objects.all().delete()
            TokenQuota.objects.all().delete()
            Client.objects.all().delete()

        # Admin user
        admin, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                "username": admin_email.split("@")[0],
                "is_staff": True,
                "is_superuser": True,
                "role": User.Role.ADMIN,
            },
        )
        if created:
            admin.set_password(admin_password)
            admin.save()
            self.stdout.write(self.style.SUCCESS(f"Created admin user {admin_email}"))
        else:
            self.stdout.write(f"Admin {admin_email} already exists, keeping it")

        # Clients
        names = GERMAN_CLIENT_NAMES[:clients]
        client_objs: list[Client] = []
        multipliers: dict[int, float] = {}
        for i, name in enumerate(names):
            c, _created = Client.objects.get_or_create(
                name=name,
                defaults={"external_id": f"CUST-{1000 + i}", "is_active": True},
            )
            client_objs.append(c)
            multipliers[c.id] = round(random.uniform(0.4, 3.0), 2)

        self.stdout.write(f"Clients: {len(client_objs)}")

        # Orders - 13 months ending today
        today = timezone.localdate()
        start_month = today.replace(day=1)
        # rewind `months - 1` months
        m = start_month
        for _ in range(months - 1):
            m = (m - timedelta(days=1)).replace(day=1)
        period_start = m

        total_orders = 0
        batch: list[Order] = []
        batch_size = 1000

        day_cursor = period_start
        end_cursor = today + timedelta(days=1)
        while day_cursor < end_cursor:
            weekday_factor = 0.4 if day_cursor.weekday() >= 5 else 1.0  # Sat/Sun dampened
            for c in client_objs:
                lam = 5.0 * multipliers[c.id] * weekday_factor
                count = _poisson(lam)
                for _ in range(count):
                    batch.append(Order(
                        client=c,
                        external_id=None,
                        created_at=random_datetime_on(day_cursor),
                        status=weighted_choice(STATUS_CHOICES),
                        document_type=random.choice(DOCUMENT_TYPES),
                        tokens_consumed=random.randint(50, 400),
                    ))
                    if len(batch) >= batch_size:
                        Order.objects.bulk_create(batch)
                        total_orders += len(batch)
                        batch = []
            day_cursor += timedelta(days=1)

        # Guarantee today has >= 20 orders for a lively morning demo
        todays_count = sum(1 for o in batch if o.created_at.date() == today) + \
                       Order.objects.filter(created_at__date=today).count()
        needed = max(0, 20 - todays_count)
        if needed > 0:
            for _ in range(needed):
                c = random.choice(client_objs)
                batch.append(Order(
                    client=c,
                    external_id=None,
                    created_at=random_datetime_on(today),
                    status=Order.Status.COMPLETED,
                    document_type=random.choice(DOCUMENT_TYPES),
                    tokens_consumed=random.randint(50, 400),
                ))

        if batch:
            Order.objects.bulk_create(batch)
            total_orders += len(batch)

        self.stdout.write(f"Orders created: {total_orders}")

        # Token quotas per client per month
        quota_objs: list[TokenQuota] = []
        m = period_start
        while m <= start_month:
            month_end = date(m.year + 1, 1, 1) if m.month == 12 else date(m.year, m.month + 1, 1)
            for c in client_objs:
                quota = random.choice(QUOTA_TIERS)
                used = _sum_tokens(c.id, m, month_end)

                # Scale quotas so current-month ratios span 2%-85%
                if m == start_month and used > 0:
                    target_ratio = random.uniform(0.02, 0.85)
                    quota = max(quota, int(used / target_ratio) + 1)

                quota_objs.append(TokenQuota(
                    client=c,
                    period_start=m,
                    quota=quota,
                    tokens_used=used,
                ))
            m = month_end

        TokenQuota.objects.bulk_create(quota_objs, ignore_conflicts=True)
        self.stdout.write(f"TokenQuota rows: {len(quota_objs)}")

        self.stdout.write(self.style.SUCCESS(
            f"\nSeed complete.\n"
            f"  Admin login: {admin_email} / {admin_password}\n"
            f"  Clients: {len(client_objs)}\n"
            f"  Orders:  {total_orders}\n"
        ))


def _poisson(lam: float) -> int:
    """Knuth's Poisson sampling - fine for small lambda."""
    import math
    L = math.exp(-lam)
    k = 0
    p = 1.0
    while True:
        k += 1
        p *= random.random()
        if p <= L:
            return k - 1


def _sum_tokens(client_id: int, start: date, end: date) -> int:
    from django.db.models import Sum
    agg = Order.objects.filter(
        client_id=client_id,
        created_at__date__gte=start,
        created_at__date__lt=end,
    ).aggregate(s=Sum("tokens_consumed"))
    return int(agg["s"] or 0)
