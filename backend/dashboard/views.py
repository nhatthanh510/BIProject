from datetime import date

from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from services.providers import get_provider


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

        return Response(
            {
                "filters": {
                    "month": f"{summary.month:%Y-%m}",
                    "client_id": summary.client_id,
                },
                "as_of": summary.as_of.isoformat(),
                "kpis": {
                    "orders_month": {"value": summary.orders_month.value},
                    "orders_total": {"value": summary.orders_total.value},
                    "orders_today": {"value": summary.orders_today.value},
                    "token_status": {
                        "tokens_used": summary.token_status.tokens_used,
                        "quota": summary.token_status.quota,
                        "percent_used": summary.token_status.percent_used,
                    },
                },
            }
        )


class OrdersTimelineView(APIView):
    def get(self, request):
        month = _parse_month(request.query_params.get("month"))
        client_id = _parse_client(request.query_params.get("client"))

        timeline = get_provider().get_orders_timeline(client_id=client_id, month=month)

        return Response(
            {
                "filters": {
                    "month": f"{timeline.month:%Y-%m}",
                    "client_id": timeline.client_id,
                },
                "as_of": timeline.as_of.isoformat(),
                "points": [{"date": p.date.isoformat(), "orders": p.orders} for p in timeline.points],
            }
        )
