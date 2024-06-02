document.addEventListener("DOMContentLoaded", function() {
    const fromCurrencySelect = $('#fromCurrency');
    const toCurrencySelect = $('#toCurrency');
    const form = $('#currencyConverterForm');
    const amountInput = $('#amount');
    const resultDiv = $('#conversionResult');

    function populateCurrencySelectors() {
        const validCurrencies = ["USD", "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM",
        "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF",
        "CHF", "CLP", "CNY", "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR",
        "FJD", "FKP", "FOK", "GBP", "GEL", "GGP", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG",
        "HUF", "IDR", "ILS", "IMP", "INR", "IQD", "IRR", "ISK", "JEP", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KID",
        "KMF", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK",
        "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR",
        "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG",
        "SEK", "SGD", "SHP", "SLE", "SLL", "SOS", "SRD", "SSP", "STN", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP",
        "TRY", "TTD", "TVD", "TWD", "TZS", "UAH", "UGX", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XDR",
        "XOF", "XPF", "YER", "ZAR", "ZMW", "ZWL"];

        validCurrencies.forEach(currency => {
            fromCurrencySelect.append(new Option(currency, currency));
            toCurrencySelect.append(new Option(currency, currency));
        });

        $('.currency-select').select2();
    }

    function convertCurrency(event) {
        event.preventDefault();
        const fromCurrency = fromCurrencySelect.val();
        const toCurrency = toCurrencySelect.val();
        const amount = amountInput.val();

        fetch(`/api/convert/?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`)
            .then(response => response.json())
            .then(data => {
                resultDiv.text(`${amount} ${fromCurrency} = ${data.convertedAmount.toFixed(2)} ${toCurrency}`);
            })
            .catch(error => {
                console.error('Ошибка:', error);
                resultDiv.text('Произошла ошибка при конвертации валюты.');
            });
    }

    form.submit(convertCurrency);
    populateCurrencySelectors();
});
