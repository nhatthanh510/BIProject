from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/clients/", include("clients.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/token-quotas/", include("tokens_usage.urls")),
    path("api/dashboard/", include("dashboard.urls")),
]
