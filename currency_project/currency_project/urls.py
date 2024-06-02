from django.contrib import admin
from django.urls import path, include  # Добавлен импорт include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('currency_tracker.urls')),  # Добавление URL из приложения currency_tracker
]
