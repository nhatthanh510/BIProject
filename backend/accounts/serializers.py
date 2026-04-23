from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "username", "role", "full_name")

    def get_full_name(self, obj: User) -> str:
        return obj.get_full_name() or obj.username or obj.email


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs: dict) -> dict:
        email = attrs["email"]
        password = attrs["password"]
        user = authenticate(username=email, password=password)
        if user is None or not user.is_active:
            raise serializers.ValidationError("Ungültige Anmeldedaten.")
        attrs["user"] = user
        return attrs
