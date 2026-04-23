"""Provider factory.

Reads `settings.DATA_PROVIDER` and returns the configured DataProvider.
Add a new provider by registering it in the PROVIDERS dict.
"""
from django.conf import settings

from .base import DataProvider
from .http_provider import HttpProvider
from .mock_provider import MockProvider

PROVIDERS: dict[str, type[DataProvider]] = {
    "mock": MockProvider,
    "http": HttpProvider,
}


def get_provider() -> DataProvider:
    name = (settings.DATA_PROVIDER or "mock").lower()
    cls = PROVIDERS.get(name)
    if cls is None:
        raise ValueError(
            f"Unknown DATA_PROVIDER={name!r}; available: {sorted(PROVIDERS)}"
        )
    return cls()
