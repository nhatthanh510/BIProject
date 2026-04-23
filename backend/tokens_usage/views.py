from rest_framework.generics import ListAPIView

from .filters import TokenQuotaFilter
from .models import TokenQuota
from .serializers import TokenQuotaSerializer


class TokenQuotaListView(ListAPIView):
    queryset = TokenQuota.objects.select_related("client")
    serializer_class = TokenQuotaSerializer
    filterset_class = TokenQuotaFilter
