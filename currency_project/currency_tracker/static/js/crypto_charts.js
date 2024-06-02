const createChart = (chartId, data, label) => {
    const color = 'rgba(55, 65, 81, 1)';

    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(point => new Date(point.time).toLocaleDateString()),
            datasets: [{
                label: label,
                data: data.map(point => point.price),
                borderColor: color,
                backgroundColor: 'rgba(55, 65, 81, 0.5)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
                fill: true
            }]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: 'rgb(17, 24, 39)'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: 'rgba(107, 114, 128, 1)',
                    }
                },
                x: {
                    ticks: {
                        color: 'rgba(107, 114, 128, 1)',
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutCubic'
            }
        }
    });
};

const fetchAndDisplayChart = (chartId, crypto, isRub = false) => {
    const currency = isRub ? 'rub' : 'usd';
    const url = `/api/crypto-data/${crypto}/${currency}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Превышен лимит запросов к API');
            }
            return response.json();
        })
        .then(data => {
            if (validateData(data)) {
                createChart(chartId, data, `${crypto.toUpperCase()} / ${isRub ? 'RUB' : 'USD'}`);
            } else {
                displayErrorMessage(chartId, 'Неверные данные графика');
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            displayErrorMessage(chartId, error.message);
        });
};

const validateData = (data) => {
    return data.every(entry => {
        const timeIsValid = !isNaN(new Date(entry.time));
        const priceIsValid = typeof entry.price === 'number' && !isNaN(entry.price);
        return timeIsValid && priceIsValid;
    });
};

const displayErrorMessage = (chartId, message) => {
    const container = document.getElementById(chartId).parentElement;
    container.innerHTML = `<div class='text-center p-4'><p class='text-lg text-red-600'>${message}</p><p class='text-sm text-gray-600'>Пожалуйста, подождите некоторое время перед следующим запросом.</p></div>`;
};


document.addEventListener("DOMContentLoaded", function() {
    fetchAndDisplayChart('btcUsdChart', 'bitcoin');
    fetchAndDisplayChart('ethUsdChart', 'ethereum');
    fetchAndDisplayChart('btcRubChart', 'bitcoin', true);
    fetchAndDisplayChart('ethRubChart', 'ethereum', true);
});
