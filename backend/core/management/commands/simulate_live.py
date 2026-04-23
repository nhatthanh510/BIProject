"""Simulate live order traffic for the demo.

Runs a loop that inserts 1-3 new orders at random intervals, for random
clients, with believable token counts. Also nudges each touched client's
current-month TokenQuota.tokens_used so the token-status KPI moves too.

Usage:
    python manage.py simulate_live
    python manage.py simulate_live --interval 5 --max-orders 5
    python manage.py simulate_live --client-id 3 --once

Ctrl+C to stop. Safe to run alongside a live demo.
"""
import random
import signal
import time
from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from clients.models import Client
from orders.models import Order
from tokens_usage.models import TokenQuota

DOCUMENT_TYPES = ["Rechnung", "Vertrag", "Lieferschein", "Angebot", "Mahnung"]
STATUS_WEIGHTS = [
    (Order.Status.COMPLETED, 85),
    (Order.Status.PROCESSING, 10),
    (Order.Status.PENDING, 3),
    (Order.Status.FAILED, 2),
]


def _first_of_month(d: date) -> date:
    return d.replace(day=1)


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
    help = "Insert new orders at random intervals to simulate live traffic for the demo."

    def add_arguments(self, parser):
        parser.add_argument(
            "--interval",
            type=float,
            default=8.0,
            help="Seconds between ticks (default 8).",
        )
        parser.add_argument(
            "--jitter",
            type=float,
            default=0.4,
            help="Random jitter factor applied to interval, 0-1 (default 0.4 = ±40%%).",
        )
        parser.add_argument(
            "--max-orders",
            type=int,
            default=3,
            help="Max orders per tick (default 3). Per-tick count is random 1..max.",
        )
        parser.add_argument(
            "--client-id",
            type=int,
            default=None,
            help="Restrict to a single client (default: random across active clients).",
        )
        parser.add_argument(
            "--once",
            action="store_true",
            help="Insert a single tick and exit (useful for 'click simulates it' demos).",
        )

    def handle(self, *args, **opts):
        rng = random.Random()
        interval: float = opts["interval"]
        jitter: float = max(0.0, min(1.0, opts["jitter"]))
        max_orders: int = max(1, opts["max_orders"])
        client_id: int | None = opts["client_id"]
        once: bool = opts["once"]

        clients = list(Client.objects.filter(is_active=True))
        if client_id is not None:
            clients = [c for c in clients if c.id == client_id]
        if not clients:
            self.stderr.write(self.style.ERROR(
                "No active clients found. Run `manage.py seed_mock_data` first."
            ))
            return

        self._install_sigint()

        self.stdout.write(self.style.SUCCESS(
            f"simulate_live starting · {len(clients)} client(s) · "
            f"interval={interval}s ±{int(jitter * 100)}% · max_orders={max_orders}"
            + (" · ONCE" if once else "")
        ))

        try:
            while True:
                count = self._tick(rng, clients, max_orders)
                self.stdout.write(
                    f"[{timezone.localtime():%H:%M:%S}] +{count} order(s)"
                )
                if once:
                    return
                wait = interval * (1 + rng.uniform(-jitter, jitter))
                time.sleep(max(0.5, wait))
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("\nsimulate_live stopped."))

    @transaction.atomic
    def _tick(self, rng: random.Random, clients: list[Client], max_orders: int) -> int:
        now = timezone.now()
        count = rng.randint(1, max_orders)

        new_orders: list[Order] = []
        tokens_by_client: dict[int, int] = {}

        for _ in range(count):
            client = rng.choice(clients)
            tokens = rng.randint(50, 400)
            new_orders.append(Order(
                client=client,
                external_id=f"LIVE-{client.id}-{int(now.timestamp())}-{rng.randint(100, 999)}",
                created_at=now,
                status=_weighted_choice(rng, STATUS_WEIGHTS),
                document_type=rng.choice(DOCUMENT_TYPES),
                tokens_consumed=tokens,
            ))
            tokens_by_client[client.id] = tokens_by_client.get(client.id, 0) + tokens

        Order.objects.bulk_create(new_orders)

        # Nudge the current-month TokenQuota for each client we touched so the
        # token-status KPI visibly moves.
        month_start = _first_of_month(timezone.localdate())
        for cid, delta in tokens_by_client.items():
            TokenQuota.objects.filter(
                client_id=cid, period_start=month_start
            ).update(tokens_used=models_F_add("tokens_used", delta))

        return count

    @staticmethod
    def _install_sigint():
        # Default behavior already raises KeyboardInterrupt; this is a no-op
        # placeholder in case we later want custom shutdown cleanup.
        signal.signal(signal.SIGINT, signal.default_int_handler)


def models_F_add(field: str, delta: int):
    """Tiny helper: F('field') + delta without importing at module top."""
    from django.db.models import F
    return F(field) + delta
