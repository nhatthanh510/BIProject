"""Data provider factory.

Reads `DATA_PROVIDER` from Django settings (env-driven) and returns a concrete
implementation. To plug in the real API, set DATA_PROVIDER=http and implement
HttpProvider.
"""
from django.conf import settings

from .base import DataProvider
from .http_provider import HttpProvider
from .mock_provider import MockProvider

_PROVIDERS: dict[str, type[DataProvider]] = {
    "mock": MockProvider,
    "http": HttpProvider,
}


def get_provider() -> DataProvider:
    name = getattr(settings, "DATA_PROVIDER", "mock")
    try:
        provider_cls = _PROVIDERS[name]
    except KeyError as exc:
        raise ValueError(
            f"Unknown DATA_PROVIDER '{name}'. Known: {list(_PROVIDERS)}"
        ) from exc
    return provider_cls()


__all__ = ["DataProvider", "get_provider"]
