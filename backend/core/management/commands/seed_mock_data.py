"""Seed the database with realistic German OCR/KI order data for the demo.

    python manage.py seed_mock_data [--flush] [--clients 8] [--months 13] \\
        [--admin-email admin@cube-bi.local] [--admin-password admin123] [--seed 42]
"""
import random
from datetime import date, datetime, time, timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from clients.models import Client
from orders.models import Order
from tokens_usage.models import TokenQuota

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
STATUS_WEIGHTS = [
    (Order.Status.COMPLETED, 85),
    (Order.Status.PROCESSING, 10),
    (Order.Status.PENDING, 3),
    (Order.Status.FAILED, 2),
]
QUOTA_TIERS = [60_000, 120_000, 250_000, 500_000]


def _first_of_month(d: date) -> date:
    return d.replace(day=1)


def _first_of_next_month(d: date) -> date:
    return date(d.year + (1 if d.month == 12 else 0), 1 if d.month == 12 else d.month + 1, 1)


def _month_start_n_months_ago(today: date, n: int) -> date:
    year = today.year
    month = today.month - n
    while month <= 0:
        month += 12
        year -= 1
    return date(year, month, 1)


def _weighted_choice(rng: random.Random, pairs):
    total = sum(w for _, w in pairs)
    r = rng.uniform(0, total)
    upto = 0
    for value, weight in pairs:
        upto += weight
        if r <= upto:
            return value
    return pairs[-1][0]


class Command(BaseCommand):
    help = "Seed realistic mock data for the Cube BI dashboard demo."

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true", help="Delete existing Orders, Quotas, Clients first.")
        parser.add_argument("--clients", type=int, default=8)
        parser.add_argument("--months", type=int, default=13)
        parser.add_argument("--admin-email", default="admin@cube-bi.local")
        parser.add_argument("--admin-password", default="admin123")
        parser.add_argument("--seed", type=int, default=42)

    @transaction.atomic
    def handle(self, *args, **opts):
        rng = random.Random(opts["seed"])

        if opts["flush"]:
            self.stdout.write(self.style.WARNING("Flushing Orders / TokenQuotas / Clients..."))
            Order.objects.all().delete()
            TokenQuota.objects.all().delete()
            Client.objects.all().delete()

        self._ensure_admin(opts["admin_email"], opts["admin_password"])

        clients = self._ensure_clients(rng, opts["clients"])
        self._seed_orders(rng, clients, opts["months"])
        self._seed_token_quotas(rng, clients, opts["months"])

        self.stdout.write(self.style.SUCCESS(
            f"Seed done. Clients: {Client.objects.count()}, Orders: {Order.objects.count()}, "
            f"TokenQuotas: {TokenQuota.objects.count()}."
        ))

    def _ensure_admin(self, email: str, password: str) -> None:
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email.split("@")[0],
                "is_staff": True,
                "is_superuser": True,
                "role": User.Role.ADMIN,
            },
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created admin user {email}"))
        else:
            self.stdout.write(f"Admin user {email} already exists, leaving password untouched.")

    def _ensure_clients(self, rng: random.Random, count: int) -> list[Client]:
        names = GERMAN_CLIENT_NAMES[:count]
        clients: list[Client] = []
        for idx, name in enumerate(names):
            external_id = f"CUST-{1000 + idx}"
            client, _ = Client.objects.get_or_create(
                external_id=external_id,
                defaults={"name": name, "is_active": True},
            )
            clients.append(client)
        # Assign a per-client volume multiplier stored on the local list only (not persisted).
        for c in clients:
            c._multiplier = rng.uniform(0.4, 3.0)  # type: ignore[attr-defined]
        return clients

    def _seed_orders(self, rng: random.Random, clients: list[Client], months: int) -> None:
        today = timezone.localdate()
        tz = timezone.get_current_timezone()

        # Clear orders in the seed window to keep reseeds deterministic.
        earliest = _month_start_n_months_ago(today, months - 1)
        Order.objects.filter(created_at__date__gte=earliest).delete()

        orders: list[Order] = []
        for client in clients:
            multiplier = getattr(client, "_multiplier", 1.0)
            cursor = earliest
            end_exclusive = _first_of_next_month(today)
            while cursor < end_exclusive:
                weekday = cursor.weekday()
                weekday_factor = 1.0 if weekday < 5 else 0.4
                lam = 5 * multiplier * weekday_factor
                n = self._poisson(rng, lam)
                for _ in range(n):
                    # Business hours weighted
                    if rng.random() < 0.6:
                        hour = rng.randint(8, 17)
                    else:
                        hour = rng.randint(0, 23)
                    minute = rng.randint(0, 59)
                    second = rng.randint(0, 59)
                    naive = datetime.combine(cursor, time(hour, minute, second))
                    aware = timezone.make_aware(naive, tz)
                    status = _weighted_choice(rng, STATUS_WEIGHTS)
                    orders.append(
                        Order(
                            client=client,
                            external_id=f"ORD-{client.id}-{int(aware.timestamp())}-{rng.randint(100, 999)}",
                            created_at=aware,
                            status=status,
                            document_type=rng.choice(DOCUMENT_TYPES),
                            tokens_consumed=rng.randint(50, 400),
                        )
                    )
                cursor = cursor + timedelta(days=1)

        # Backstop: ensure today has >= 20 orders across all clients for a lively "Aufträge heute".
        today_count = sum(1 for o in orders if o.created_at.astimezone(tz).date() == today)
        shortfall = max(0, 20 - today_count)
        if shortfall > 0:
            for _ in range(shortfall):
                client = rng.choice(clients)
                hour = rng.randint(8, 17)
                naive = datetime.combine(today, time(hour, rng.randint(0, 59), rng.randint(0, 59)))
                aware = timezone.make_aware(naive, tz)
                orders.append(
                    Order(
                        client=client,
                        external_id=f"ORD-{client.id}-{int(aware.timestamp())}-{rng.randint(100, 999)}",
                        created_at=aware,
                        status=Order.Status.COMPLETED,
                        document_type=rng.choice(DOCUMENT_TYPES),
                        tokens_consumed=rng.randint(50, 400),
                    )
                )

        Order.objects.bulk_create(orders, batch_size=2000)
        self.stdout.write(f"Created {len(orders)} orders.")

    def _seed_token_quotas(self, rng: random.Random, clients: list[Client], months: int) -> None:
        today = timezone.localdate()
        current_month = _first_of_month(today)

        # Clear quotas in window.
        earliest = _month_start_n_months_ago(today, months - 1)
        TokenQuota.objects.filter(period_start__gte=earliest).delete()

        quotas: list[TokenQuota] = []
        for client in clients:
            base_quota = rng.choice(QUOTA_TIERS)
            cursor = earliest
            end_exclusive = _first_of_next_month(today)
            while cursor < end_exclusive:
                next_month = _first_of_next_month(cursor)
                tokens_used = (
                    Order.objects.filter(
                        client=client,
                        created_at__date__gte=cursor,
                        created_at__date__lt=next_month,
                    )
                    .values_list("tokens_consumed", flat=True)
                )
                total_used = sum(tokens_used)

                if cursor == current_month:
                    # Rescale quota so single-client percent_used lands 2%-85%.
                    target_pct = rng.uniform(0.02, 0.85)
                    if total_used > 0:
                        candidate = int(total_used / target_pct)
                        # Round to nearest QUOTA_TIER above candidate
                        quota = next((q for q in QUOTA_TIERS if q >= candidate), QUOTA_TIERS[-1])
                    else:
                        quota = base_quota
                else:
                    quota = base_quota

                quotas.append(TokenQuota(
                    client=client,
                    period_start=cursor,
                    quota=quota,
                    tokens_used=total_used,
                ))
                cursor = next_month

        TokenQuota.objects.bulk_create(quotas, batch_size=500)
        self.stdout.write(f"Created {len(quotas)} token quotas.")

    @staticmethod
    def _poisson(rng: random.Random, lam: float) -> int:
        # Knuth's algorithm; good enough for lam in [0, ~20]
        if lam <= 0:
            return 0
        import math
        L = math.exp(-lam)
        k = 0
        p = 1.0
        while True:
            k += 1
            p *= rng.random()
            if p <= L:
                return k - 1
