"""HTTP data provider - stub.

Fill this in once the real API spec arrives. Enable by setting
DATA_PROVIDER=http and HTTP_PROVIDER_BASE_URL in backend/.env.
"""
from datetime import date

from django.conf import settings

from .base import ClientDTO, DataProvider, SummaryDTO, TimelineDTO


class HttpProvider(DataProvider):
    def __init__(self) -> None:
        self.base_url = settings.HTTP_PROVIDER_BASE_URL
        self.api_key = settings.HTTP_PROVIDER_API_KEY
        if not self.base_url:
            # Lazy check - only raises when the provider is actually used,
            # so `DATA_PROVIDER=http` without a base URL still boots the server.
            pass

    def _require_config(self, method: str) -> None:
        if not self.base_url:
            raise NotImplementedError(
                f"HttpProvider.{method} requires HTTP_PROVIDER_BASE_URL in backend/.env "
                "and a real implementation. See services/providers/http_provider.py."
            )

    def list_clients(self) -> list[ClientDTO]:
        self._require_config("list_clients")
        raise NotImplementedError("HttpProvider.list_clients - implement HTTP call to real API")

    def get_summary(self, *, client_id: int | None, month: date) -> SummaryDTO:
        self._require_config("get_summary")
        raise NotImplementedError("HttpProvider.get_summary - implement HTTP call to real API")

    def get_orders_timeline(self, *, client_id: int | None, month: date) -> TimelineDTO:
        self._require_config("get_orders_timeline")
        raise NotImplementedError("HttpProvider.get_orders_timeline - implement HTTP call to real API")
