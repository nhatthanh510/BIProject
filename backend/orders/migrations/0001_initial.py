import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("clients", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Order",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("external_id", models.CharField(blank=True, max_length=128, null=True)),
                ("created_at", models.DateTimeField(db_index=True)),
                ("status", models.CharField(
                    choices=[
                        ("pending", "Pending"),
                        ("processing", "Processing"),
                        ("completed", "Completed"),
                        ("failed", "Failed"),
                    ],
                    default="completed",
                    max_length=16,
                )),
                ("document_type", models.CharField(default="Rechnung", max_length=64)),
                ("tokens_consumed", models.PositiveIntegerField(default=0)),
                ("client", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="orders",
                    to="clients.client",
                )),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["client", "created_at"], name="orders_orde_client__c94b92_idx"),
                    models.Index(fields=["created_at"], name="orders_orde_created_ce98fc_idx"),
                ],
            },
        ),
    ]
