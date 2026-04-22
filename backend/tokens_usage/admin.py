from django.contrib import admin

from .models import TokenQuota


@admin.register(TokenQuota)
class TokenQuotaAdmin(admin.ModelAdmin):
    list_display = ("client", "period_start", "tokens_used", "quota")
    list_filter = ("period_start", "client")
