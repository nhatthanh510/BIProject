from django.contrib import admin

from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "client", "created_at", "status", "document_type", "tokens_consumed")
    list_filter = ("status", "document_type", "client")
    date_hierarchy = "created_at"
    search_fields = ("external_id", "client__name")
