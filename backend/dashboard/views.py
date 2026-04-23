from datetime import date

from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from services.providers import get_provider

from .serializers import SummaryResponseSerializer, TimelineResponseSerializer


def _parse_month(value: str | None) -> date:
    if value:
        try:
            year_s, month_s = value.split("-")
            return date(int(year_s), int(month_s), 1)
        except (ValueError, AttributeError):
            pass
    today = timezone.localdate()
    return today.replace(day=1)


def _parse_client(value: str | None) -> int | None:
    if not value:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


class SummaryView(APIView):
    def get(self, request):
        month = _parse_month(request.query_params.get("month"))
        client_id = _parse_client(request.query_params.get("client"))

        summary = get_provider().get_summary(client_id=client_id, month=month)

        payload = {
            "filters": {
                "month": f"{summary.month:%Y-%m}",
                "client_id": summary.client_id,
            },
            "as_of": summary.as_of,
            "kpis": {
                "orders_month": {"value": summary.orders_month.value},
                "orders_total": {"value": summary.orders_total.value},
                "orders_today": {"value": summary.orders_today.value},
                "token_status": {
                    "tokens_used": summary.token_status.tokens_used,
                    "quota": summary.token_status.quota,
                    "percent_used": summary.token_status.percent_used,
                },
                "revenue": {
                    "month_to_date": summary.revenue.month_to_date,
                    "today": summary.revenue.today,
                    "projected_month": summary.revenue.projected_month,
                    "target_month": summary.revenue.target_month,
                    "pace_pct": summary.revenue.pace_pct,
                    "currency": summary.revenue.currency,
                },
            },
        }
        serializer = SummaryResponseSerializer(payload)
        return Response(serializer.data)


class OrdersTimelineView(APIView):
    def get(self, request):
        month = _parse_month(request.query_params.get("month"))
        client_id = _parse_client(request.query_params.get("client"))

        timeline = get_provider().get_orders_timeline(client_id=client_id, month=month)

        payload = {
            "filters": {
                "month": f"{timeline.month:%Y-%m}",
                "client_id": timeline.client_id,
            },
            "as_of": timeline.as_of,
            "points": [{"date": p.date, "orders": p.orders} for p in timeline.points],
        }
        serializer = TimelineResponseSerializer(payload)
        return Response(serializer.data)
