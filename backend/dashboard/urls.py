from django.urls import path

from .views import OrdersTimelineView, SummaryView

urlpatterns = [
    path("summary/", SummaryView.as_view(), name="dashboard-summary"),
    path("orders-timeline/", OrdersTimelineView.as_view(), name="dashboard-orders-timeline"),
]
