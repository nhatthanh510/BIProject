"""HTTP provider: stub.

Once the customer sends their API documentation, fill in the three methods
below with real HTTP calls. The dashboard views don't need to change.

Switch on with `DATA_PROVIDER=http` in backend/.env.
"""
from datetime import date

from django.conf import settings

from .base import (
    ClientDTO,
    DataProvider,
    SummaryDTO,
    TimelineDTO,
)


class HttpProvider(DataProvider):
    def __init__(self) -> None:
        self.base_url = (settings.HTTP_PROVIDER_BASE_URL or "").rstrip("/")
        self.api_key = settings.HTTP_PROVIDER_API_KEY or ""
        # Optional: create a requests.Session() here when implementing.

    def list_clients(self) -> list[ClientDTO]:
        raise NotImplementedError(
            "HttpProvider.list_clients — implement HTTP call to real API "
            "(see backend/services/providers/http_provider.py)"
        )

    def get_summary(self, *, client_id: int | None, month: date) -> SummaryDTO:
        raise NotImplementedError(
            "HttpProvider.get_summary — implement HTTP call to real API "
            "(see backend/services/providers/http_provider.py)"
        )

    def get_orders_timeline(self, *, client_id: int | None, month: date) -> TimelineDTO:
        raise NotImplementedError(
            "HttpProvider.get_orders_timeline — implement HTTP call to real API "
            "(see backend/services/providers/http_provider.py)"
        )
