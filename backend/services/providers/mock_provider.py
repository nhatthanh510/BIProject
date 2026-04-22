"""Mock data provider - reads from the local Django DB populated by `seed_mock_data`."""
from datetime import date, datetime, timedelta

from django.db.models import Count, Sum
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


def _month_bounds(month: date) -> tuple[date, date]:
    start = month.replace(day=1)
    end = date(start.year + 1, 1, 1) if start.month == 12 else date(start.year, start.month + 1, 1)
    return start, end


class MockProvider(DataProvider):
    def list_clients(self) -> list[ClientDTO]:
        return [
            ClientDTO(id=c.id, name=c.name, is_active=c.is_active)
            for c in Client.objects.filter(is_active=True).order_by("name")
        ]

    def get_summary(self, *, client_id: int | None, month: date) -> SummaryDTO:
        start, end = _month_bounds(month)
        today = timezone.localdate()

        qs = Order.objects.all()
        if client_id is not None:
            qs = qs.filter(client_id=client_id)

        orders_month = qs.filter(created_at__date__gte=start, created_at__date__lt=end).count()
        orders_total = qs.count()
        orders_today = qs.filter(created_at__date=today).count()

        quota_qs = TokenQuota.objects.filter(period_start=start)
        if client_id is not None:
            quota_qs = quota_qs.filter(client_id=client_id)

        agg = quota_qs.aggregate(used=Sum("tokens_used"), total=Sum("quota"))
        tokens_used = int(agg["used"] or 0)
        quota = int(agg["total"] or 0)

        return SummaryDTO(
            as_of=timezone.now(),
            month=start,
            client_id=client_id,
            orders_month=KpiValue(value=orders_month),
            orders_total=KpiValue(value=orders_total),
            orders_today=KpiValue(value=orders_today),
            token_status=TokenStatus(tokens_used=tokens_used, quota=quota),
        )

    def get_orders_timeline(self, *, client_id: int | None, month: date) -> TimelineDTO:
        start, end = _month_bounds(month)

        qs = Order.objects.filter(created_at__date__gte=start, created_at__date__lt=end)
        if client_id is not None:
            qs = qs.filter(client_id=client_id)

        rows = (
            qs.values("created_at__date")
            .annotate(orders=Count("id"))
            .order_by("created_at__date")
        )
        counts: dict[date, int] = {r["created_at__date"]: r["orders"] for r in rows}

        # Zero-fill every day in the month so Recharts draws a continuous axis
        points: list[TimelinePoint] = []
        day = start
        while day < end:
            points.append(TimelinePoint(date=day, orders=counts.get(day, 0)))
            day += timedelta(days=1)

        return TimelineDTO(
            as_of=timezone.now(),
            month=start,
            client_id=client_id,
            points=points,
        )
