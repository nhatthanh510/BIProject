from rest_framework import serializers

from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "client",
            "client_name",
            "external_id",
            "created_at",
            "status",
            "document_type",
            "tokens_consumed",
        ]
