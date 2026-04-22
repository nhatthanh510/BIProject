from django.db import models

from clients.models import Client


class TokenQuota(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="token_quotas")
    period_start = models.DateField(help_text="First day of the month this quota applies to")
    quota = models.PositiveIntegerField()
    tokens_used = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = [("client", "period_start")]
        ordering = ["-period_start"]

    def __str__(self) -> str:
        return f"{self.client.name} {self.period_start:%Y-%m}: {self.tokens_used}/{self.quota}"
