from datetime import date

import django_filters
from django.utils.dateparse import parse_date

from .models import Order


class OrderFilter(django_filters.FilterSet):
    """Filter orders by ?month=YYYY-MM, ?client=<id>, ?status=<status>."""

    month = django_filters.CharFilter(method="filter_month")
    client = django_filters.NumberFilter(field_name="client_id")
    status = django_filters.CharFilter(field_name="status")

    class Meta:
        model = Order
        fields = ["client", "status", "month"]

    def filter_month(self, queryset, name, value):
        if not value:
            return queryset
        try:
            start = parse_date(f"{value}-01")
            if start is None:
                return queryset
        except (TypeError, ValueError):
            return queryset
        # compute first day of next month
        if start.month == 12:
            end = date(start.year + 1, 1, 1)
        else:
            end = date(start.year, start.month + 1, 1)
        return queryset.filter(created_at__date__gte=start, created_at__date__lt=end)
