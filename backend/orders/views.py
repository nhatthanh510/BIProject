from rest_framework import viewsets

from .filters import OrderFilter
from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Order.objects.select_related("client").all()
    serializer_class = OrderSerializer
    filterset_class = OrderFilter
