from django.urls import path

from .views import TokenQuotaListView

urlpatterns = [
    path("", TokenQuotaListView.as_view(), name="token-quota-list"),
]
