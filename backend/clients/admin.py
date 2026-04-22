from django.contrib import admin

from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ("name", "external_id", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "external_id")
