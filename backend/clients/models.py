from django.db import models


class Client(models.Model):
    name = models.CharField(max_length=255)
    external_id = models.CharField(max_length=128, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
