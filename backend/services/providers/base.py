"""Abstract data provider.

The dashboard views call `get_provider().get_summary(...)` etc. Swapping from
mock to the real API is a single env var change (`DATA_PROVIDER=http`) plus
filling in HttpProvider with the real HTTP calls.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date, datetime


@dataclass
class ClientDTO:
    id: int
    name: str
    is_active: bool


@dataclass
class KpiValue:
    value: int


@dataclass
class TokenStatus:
    tokens_used: int
    quota: int

    @property
    def percent_used(self) -> float:
        if self.quota <= 0:
            return 0.0
        return round((self.tokens_used / self.quota) * 100, 2)


@dataclass
class SummaryDTO:
    as_of: datetime
    month: date
    client_id: int | None
    orders_month: KpiValue
    orders_total: KpiValue
    orders_today: KpiValue
    token_status: TokenStatus


@dataclass
class TimelinePoint:
    date: date
    orders: int


@dataclass
class TimelineDTO:
    as_of: datetime
    month: date
    client_id: int | None
    points: list[TimelinePoint]


class DataProvider(ABC):
    @abstractmethod
    def list_clients(self) -> list[ClientDTO]:
        raise NotImplementedError

    @abstractmethod
    def get_summary(self, *, client_id: int | None, month: date) -> SummaryDTO:
        raise NotImplementedError

    @abstractmethod
    def get_orders_timeline(self, *, client_id: int | None, month: date) -> TimelineDTO:
        raise NotImplementedError
