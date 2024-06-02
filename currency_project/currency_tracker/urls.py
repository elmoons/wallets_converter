from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('currency-cards/', views.currency_cards, name='currency-cards'),
    path('delete-currency-pair/', views.delete_currency_pair, name='delete-currency-pair'),
    path('crypto-charts/', views.crypto_charts, name='crypto_charts'),
    path('converter/', views.converter, name='converter'),
    path('api/crypto-data/<str:crypto>/<str:currency>/', views.fetch_crypto_data, name='fetch_crypto_data'),
    path('api/convert/', views.convert_currency, name='convert_currency'),
]
