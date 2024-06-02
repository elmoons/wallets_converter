import requests
from django.conf import settings


def get_exchange_rate(base, target):
    url = f"https://v6.exchangerate-api.com/v6/{settings.EXCHANGERATE_API_KEY}/latest/{base}"
    response = requests.get(url)
    data = response.json()
    if data['result'] == 'success':
        return data['conversion_rates'].get(target, "Курс не найден")
    else:
        return "Ошибка API: " + data.get('error', {}).get('type', 'Неизвестная ошибка')
