from rest_framework import serializers


class KpiValueSerializer(serializers.Serializer):
    value = serializers.IntegerField()


class TokenStatusSerializer(serializers.Serializer):
    tokens_used = serializers.IntegerField()
    quota = serializers.IntegerField()
    percent_used = serializers.FloatField()


class KpisSerializer(serializers.Serializer):
    orders_month = KpiValueSerializer()
    orders_total = KpiValueSerializer()
    orders_today = KpiValueSerializer()
    token_status = TokenStatusSerializer()


class TimelinePointSerializer(serializers.Serializer):
    date = serializers.DateField()
    orders = serializers.IntegerField()
