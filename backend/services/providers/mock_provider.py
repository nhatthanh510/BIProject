"""Mock provider: reads from the local Django database.

Used in dev and demo. Seed the DB with `manage.py seed_mock_data`.
"""
from datetime import date, timedelta

from django.db.models import Sum
from django.utils import timezone

from clients.models import Client
from orders.models import Order
from tokens_usage.models import TokenQuota

from .base import (
    ClientDTO,
    DataProvider,
    KpiValue,
    SummaryDTO,
    TimelineDTO,
    TimelinePoint,
    TokenStatus,
)


def _first_of_next_month(d: date) -> date:
    return date(d.year + (1 if d.month == 12 else 0), 1 if d.month == 12 else d.month + 1, 1)


class MockProvider(DataProvider):
    def list_clients(self) -> list[ClientDTO]:
        return [
            ClientDTO(id=c.id, name=c.name, is_active=c.is_active)
            for c in Client.objects.filter(is_active=True)
        ]

    def _orders_qs(self, client_id: int | None):
        qs = Order.objects.all()
        if client_id is not None:
            qs = qs.filter(client_id=client_id)
        return qs

    def get_summary(self, *, client_id: int | None, month: date) -> SummaryDTO:
        month_start = month.replace(day=1)
        month_end = _first_of_next_month(month_start)
        today = timezone.localdate()

        qs = self._orders_qs(client_id)

        orders_month = qs.filter(
            created_at__date__gte=month_start,
            created_at__date__lt=month_end,
        ).count()
        orders_total = qs.count()
        orders_today = qs.filter(created_at__date=today).count()

        quotas = TokenQuota.objects.filter(period_start=month_start)
        if client_id is not None:
            quotas = quotas.filter(client_id=client_id)
        agg = quotas.aggregate(used=Sum("tokens_used"), quota=Sum("quota"))
        tokens_used = int(agg["used"] or 0)
        quota_total = int(agg["quota"] or 0)

        return SummaryDTO(
            as_of=timezone.now(),
            month=month_start,
            client_id=client_id,
            orders_month=KpiValue(value=orders_month),
            orders_total=KpiValue(value=orders_total),
            orders_today=KpiValue(value=orders_today),
            token_status=TokenStatus(tokens_used=tokens_used, quota=quota_total),
        )

    def get_orders_timeline(self, *, client_id: int | None, month: date) -> TimelineDTO:
        month_start = month.replace(day=1)
        month_end = _first_of_next_month(month_start)

        qs = self._orders_qs(client_id).filter(
            created_at__date__gte=month_start,
            created_at__date__lt=month_end,
        )

        counts: dict[date, int] = {}
        for o in qs.values_list("created_at", flat=True):
            d = timezone.localtime(o).date()
            counts[d] = counts.get(d, 0) + 1

        points: list[TimelinePoint] = []
        cursor = month_start
        while cursor < month_end:
            points.append(TimelinePoint(date=cursor, orders=counts.get(cursor, 0)))
            cursor = cursor + timedelta(days=1)

        return TimelineDTO(
            as_of=timezone.now(),
            month=month_start,
            client_id=client_id,
            points=points,
        )
