from rest_framework.generics import ListAPIView

from .filters import OrderFilter
from .models import Order
from .serializers import OrderSerializer


class OrderListView(ListAPIView):
    queryset = Order.objects.select_related("client")
    serializer_class = OrderSerializer
    filterset_class = OrderFilter
