from django.db import models


class CurrencyPair(models.Model):
    base_currency = models.CharField(max_length=3)
    target_currency = models.CharField(max_length=3)
    tracked_since = models.DateTimeField(auto_now_add=True)
    email = models.EmailField()

    def __str__(self):
        return f"{self.base_currency}/{self.target_currency}"
