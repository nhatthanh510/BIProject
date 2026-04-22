import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("clients", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="TokenQuota",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("period_start", models.DateField(help_text="First day of the month this quota applies to")),
                ("quota", models.PositiveIntegerField()),
                ("tokens_used", models.PositiveIntegerField(default=0)),
                ("client", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="token_quotas",
                    to="clients.client",
                )),
            ],
            options={
                "ordering": ["-period_start"],
                "unique_together": {("client", "period_start")},
            },
        ),
    ]
