document.addEventListener("DOMContentLoaded", function() {
    const validCurrencies = ["USD", "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD",
        "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF",
        "CLP", "CNY", "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD",
        "FKP", "FOK", "GBP", "GEL", "GGP", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF",
        "IDR", "ILS", "IMP", "INR", "IQD", "IRR", "ISK", "JEP", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KID", "KMF",
        "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT",
        "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB",
        "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK",
        "SGD", "SHP", "SLE", "SLL", "SOS", "SRD", "SSP", "STN", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY",
        "TTD", "TVD", "TWD", "TZS", "UAH", "UGX", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XDR", "XOF",
        "XPF", "YER", "ZAR", "ZMW", "ZWL"
    ];

    const form = document.querySelector('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const baseCurrency = document.getElementById('baseCurrency').value.toUpperCase();
        const targetCurrency = document.getElementById('targetCurrency').value.toUpperCase();
        const adminKey = document.getElementById('adminKey').value;
        const email = document.getElementById('email').value;

        if (!validCurrencies.includes(baseCurrency) || !validCurrencies.includes(targetCurrency)) {
            Swal.fire('Ошибка!', 'Неверный код валюты', 'error');
            return;
        }

        fetch('/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    baseCurrency: baseCurrency,
                    targetCurrency: targetCurrency,
                    adminKey: adminKey,
                    email: email
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('Успех!', 'Пара добавлена', 'success');
                    updateCurrencyCards();
                } else {
                    Swal.fire('Ошибка!', data.error, 'error');
                }
            });
    });

    function updateCurrencyCards() {
        fetch('/currency-cards/')
            .then(response => response.text())
            .then(data => {
                const cardsContainer = document.querySelector('.cards-container');
                cardsContainer.innerHTML = data;

                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const baseCurrency = button.getAttribute('data-base-currency');
                        const targetCurrency = button.getAttribute('data-target-currency');
                        deleteCurrencyPair(baseCurrency, targetCurrency);
                    });
                });

            });
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function deleteCurrencyPair(baseCurrency, targetCurrency) {
        Swal.fire({
            title: 'Введите ключ авторизации для подтверждения',
            input: 'password',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Удалить',
            showLoaderOnConfirm: true,
            preConfirm: (adminKey) => {
                return fetch(`/delete-currency-pair/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken'),
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            baseCurrency,
                            targetCurrency,
                            adminKey
                        })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(response.statusText)
                        }
                        return response.json();
                    })
                    .catch(error => {
                        Swal.showValidationMessage(`Request failed: ${error}`)
                    });
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                if (result.value.success) {
                    Swal.fire('Удалено!', '', 'success');
                    updateCurrencyCards();
                } else {
                    Swal.fire('Ошибка!', result.value.error, 'error');
                }
            }
        });
    }


    updateCurrencyCards();
});