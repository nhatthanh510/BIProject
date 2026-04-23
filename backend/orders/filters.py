from datetime import date

import django_filters

from .models import Order


def _first_of_next_month(d: date) -> date:
    return date(d.year + (1 if d.month == 12 else 0), 1 if d.month == 12 else d.month + 1, 1)


class OrderFilter(django_filters.FilterSet):
    month = django_filters.CharFilter(method="filter_month")
    client = django_filters.NumberFilter(field_name="client_id")
    status = django_filters.ChoiceFilter(choices=Order.Status.choices)

    class Meta:
        model = Order
        fields = ["month", "client", "status"]

    def filter_month(self, queryset, name, value):
        # value format: YYYY-MM
        try:
            year_s, month_s = value.split("-")
            start = date(int(year_s), int(month_s), 1)
        except (ValueError, AttributeError):
            return queryset.none()
        end = _first_of_next_month(start)
        return queryset.filter(created_at__date__gte=start, created_at__date__lt=end)
