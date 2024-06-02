from django.shortcuts import render
from django.conf import settings
from .models import CurrencyPair
from .services import get_exchange_rate
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from django.utils import timezone
from datetime import timedelta


def send_email_notification(receiver, subject, body):
    sender = 'no_reply@mydomain.com'

    msg = MIMEMultipart()
    msg['From'] = sender
    msg['To'] = receiver
    msg['Subject'] = Header(subject, 'utf-8')
    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    try:
        smtp_obj = smtplib.SMTP("smtp.gmail.com", 587)
        smtp_obj.ehlo()
        smtp_obj.starttls()
        smtp_obj.ehlo()
        smtp_obj.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
        smtp_obj.sendmail(sender, [receiver], msg.as_string())
        print("Successfully sent email")
    except smtplib.SMTPException as e:
        print("Error: unable to send email", e)


@csrf_exempt
def index(request):
    send_rates_email()
    if request.method == 'POST':
        data = json.loads(request.body)
        base_currency = data.get('baseCurrency')
        target_currency = data.get('targetCurrency')
        email = data.get('email')
        admin_key = data.get('adminKey')

        if CurrencyPair.objects.filter(base_currency=base_currency, target_currency=target_currency, email=email).exists():
            return JsonResponse({"success": False, "error": "Такая пара валют уже существует"})

        if admin_key == settings.ADMIN_KEY:
            email = data.get('email')
            CurrencyPair.objects.create(base_currency=base_currency, target_currency=target_currency, email=email)
            send_email_notification(email, 'Новая валютная пара добавлена',
                                    f'Была добавлена пара {base_currency}/{target_currency}.')
            return JsonResponse({"success": True})
        else:
            return JsonResponse({"success": False, "error": "Неверный ключ авторизации"})

    pairs = CurrencyPair.objects.all()
    rates = {pair: get_exchange_rate(pair.base_currency, pair.target_currency) for pair in pairs}
    return render(request, 'index.html', {'rates': rates})


def currency_cards(request):
    pairs = CurrencyPair.objects.all()
    rates = {pair: get_exchange_rate(pair.base_currency, pair.target_currency) for pair in pairs}
    return render(request, 'currency_cards.html', {'rates': rates})


@csrf_exempt
def delete_currency_pair(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        admin_key = data.get('adminKey')
        base_currency = data.get('baseCurrency')
        target_currency = data.get('targetCurrency')

        if admin_key == settings.ADMIN_KEY:
            pair_query = CurrencyPair.objects.filter(base_currency=base_currency, target_currency=target_currency)
            if pair_query.exists():
                pair = pair_query.first()  # Получаем первый (и, вероятно, единственный) объект из QuerySet
                email = pair.email
                pair.delete()
                send_email_notification(email, 'Валютная пара удалена',
                                        f'Пара {base_currency}/{target_currency} была удалена.')
                return JsonResponse({"success": True})
            else:
                return JsonResponse({"success": False, "error": "Валютная пара не найдена"})
        else:
            return JsonResponse({"success": False, "error": "Неверный ключ авторизации"})

    return JsonResponse({"success": False, "error": "Неверный запрос"})


def send_rates_email():
    now = timezone.now()
    five_minutes_ago = now - timedelta(minutes=5)
    for email in CurrencyPair.objects.filter(tracked_since__lte=five_minutes_ago).values_list('email', flat=True).distinct():
        pairs = CurrencyPair.objects.filter(email=email)
        rates_info = "\n".join(
            f"{pair.base_currency}/{pair.target_currency}: {get_exchange_rate(pair.base_currency, pair.target_currency)}"
            for pair in pairs
        )
        send_email_notification(email, 'Обновление курсов валют', rates_info)
        pairs.update(tracked_since=now)


def crypto_charts(request):
    return render(request, 'crypto_charts.html')


def converter(request):
    return render(request, 'converter.html')


def fetch_crypto_data(request, crypto, currency):
    response = requests.get(f'https://api.coingecko.com/api/v3/coins/{crypto}/market_chart?vs_currency=usd&days=30')
    if response.status_code == 200:
        data = response.json()['prices']
        if currency == 'rub':
            usd_to_rub_rate = get_exchange_rate('USD', 'RUB')
            data = [{'time': point[0], 'price': point[1] * usd_to_rub_rate} for point in data]
        else:  # Предполагается, что currency == 'usd'
            data = [{'time': point[0], 'price': point[1]} for point in data]
        return JsonResponse(data, safe=False)
    else:
        return JsonResponse({'error': 'Ошибка при получении данных'}, status=500)


def convert_currency(request):
    from_currency = request.GET.get('from')
    to_currency = request.GET.get('to')
    amount = float(request.GET.get('amount', 0))

    rate = get_exchange_rate(from_currency, to_currency)
    converted_amount = amount * rate

    return JsonResponse({'convertedAmount': converted_amount})