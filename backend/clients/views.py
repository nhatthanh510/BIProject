from rest_framework.viewsets import ReadOnlyModelViewSet

from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(ReadOnlyModelViewSet):
    queryset = Client.objects.filter(is_active=True)
    serializer_class = ClientSerializer
    pagination_class = None
