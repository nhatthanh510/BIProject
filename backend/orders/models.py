from django.db import models

from clients.models import Client


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="orders")
    external_id = models.CharField(max_length=128, null=True, blank=True)
    created_at = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.COMPLETED)
    document_type = models.CharField(max_length=64, default="Rechnung")
    tokens_consumed = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["client", "created_at"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self) -> str:
        return f"Order #{self.pk} ({self.client.name}, {self.created_at:%Y-%m-%d})"
