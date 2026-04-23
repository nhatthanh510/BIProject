from rest_framework import serializers

from .models import TokenQuota


class TokenQuotaSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    percent_used = serializers.SerializerMethodField()

    class Meta:
        model = TokenQuota
        fields = (
            "id",
            "client",
            "client_name",
            "period_start",
            "quota",
            "tokens_used",
            "percent_used",
        )

    def get_percent_used(self, obj: TokenQuota) -> float:
        if obj.quota <= 0:
            return 0.0
        return round((obj.tokens_used / obj.quota) * 100, 2)
