from datetime import date

import django_filters

from .models import TokenQuota


class TokenQuotaFilter(django_filters.FilterSet):
    month = django_filters.CharFilter(method="filter_month")
    client = django_filters.NumberFilter(field_name="client_id")

    class Meta:
        model = TokenQuota
        fields = ["month", "client"]

    def filter_month(self, queryset, name, value):
        try:
            year_s, month_s = value.split("-")
            start = date(int(year_s), int(month_s), 1)
        except (ValueError, AttributeError):
            return queryset.none()
        return queryset.filter(period_start=start)
