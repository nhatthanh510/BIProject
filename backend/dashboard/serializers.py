from rest_framework import serializers


class KpiValueSerializer(serializers.Serializer):
    value = serializers.IntegerField()


class TokenStatusSerializer(serializers.Serializer):
    tokens_used = serializers.IntegerField()
    quota = serializers.IntegerField()
    percent_used = serializers.FloatField()


class RevenueStatusSerializer(serializers.Serializer):
    month_to_date = serializers.FloatField()
    today = serializers.FloatField()
    projected_month = serializers.FloatField()
    target_month = serializers.FloatField()
    pace_pct = serializers.FloatField()
    currency = serializers.CharField()


class KpisSerializer(serializers.Serializer):
    orders_month = KpiValueSerializer()
    orders_total = KpiValueSerializer()
    orders_today = KpiValueSerializer()
    token_status = TokenStatusSerializer()
    revenue = RevenueStatusSerializer()


class SummaryFiltersSerializer(serializers.Serializer):
    month = serializers.CharField()
    client_id = serializers.IntegerField(allow_null=True)


class SummaryResponseSerializer(serializers.Serializer):
    filters = SummaryFiltersSerializer()
    as_of = serializers.DateTimeField()
    kpis = KpisSerializer()


class TimelinePointSerializer(serializers.Serializer):
    date = serializers.DateField()
    orders = serializers.IntegerField()


class TimelineResponseSerializer(serializers.Serializer):
    filters = SummaryFiltersSerializer()
    as_of = serializers.DateTimeField()
    points = TimelinePointSerializer(many=True)
