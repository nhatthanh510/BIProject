from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "username", "role", "full_name"]

    def get_full_name(self, obj: User) -> str:
        name = (f"{obj.first_name} {obj.last_name}").strip()
        return name or obj.username or obj.email


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["email"],
            password=attrs["password"],
        )
        if not user or not user.is_active:
            raise serializers.ValidationError(
                {"detail": "Ungültige Anmeldedaten."}
            )
        attrs["user"] = user
        return attrs
