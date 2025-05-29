// charts.js

// Variable global para almacenar las instancias de los gráficos
let salesChartInstance = null;
let inventoryChartInstance = null;

/**
 * Dibuja o actualiza el gráfico de ventas.
 * @param {Array} data - Un array de objetos con { date, quantity }.
 */
function drawSalesChart(data) {
    const ctx = document.getElementById('salesChart');

    if (!ctx) {
        console.warn("Canvas para el gráfico de ventas no encontrado.");
        return;
    }

    // Preparar los datos para el gráfico
    // Limitar los datos a los últimos 7 días o a un número razonable si hay muchos
    const latestData = data.slice(0, 7).reverse(); // Tomar los últimos 7 y ordenarlos cronológicamente

    const labels = latestData.map(item => {
        // Formatear la fecha para que sea más legible en el eje X
        const dateObj = item.date instanceof Date ? item.date : new Date(item.date);
        return dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    });
    const quantities = latestData.map(item => item.quantity);

    const chartConfig = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Unidades Vendidas',
                data: quantities,
                backgroundColor: 'rgba(54, 162, 235, 0.7)', // Azul
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Permite que el tamaño se ajuste al contenedor
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Unidades'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            }
        }
    };

    if (salesChartInstance) {
        // Si el gráfico ya existe, actualiza sus datos
        salesChartInstance.data.labels = labels;
        salesChartInstance.data.datasets[0].data = quantities;
        salesChartInstance.update();
    } else {
        // Si no existe, crea una nueva instancia
        salesChartInstance = new Chart(ctx, chartConfig);
    }
}

/**
 * Dibuja o actualiza el gráfico de estado de inventario (Pie Chart).
 * @param {number} currentStock - El stock actual.
 * @param {number} totalUnitsSold - El total de unidades vendidas acumuladas.
 */
function drawInventoryChart(currentStock, totalUnitsSold) {
    const ctx = document.getElementById('inventoryChart');

    if (!ctx) {
        console.warn("Canvas para el gráfico de inventario no encontrado.");
        return;
    }

    // Para el gráfico de inventario, si solo hay stock, podemos mostrarlo así.
    // Si no hay stock ni ventas, o si los datos son negativos, ajustar para evitar errores en el gráfico.
    const stockData = Math.max(0, currentStock);
    const soldData = Math.max(0, totalUnitsSold);

    const data = {
        labels: ['Stock Actual', 'Unidades Vendidas (Históricas)'],
        datasets: [{
            data: [stockData, soldData],
            backgroundColor: [
                'rgba(75, 192, 192, 0.7)', // Verde azulado
                'rgba(255, 159, 64, 0.7)'  // Naranja
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    };

    const chartConfig = {
        type: 'pie', // Cambiado a 'pie'
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            let label = tooltipItem.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += tooltipItem.raw + ' unidades';
                            return label;
                        }
                    }
                }
            }
        }
    };

    if (inventoryChartInstance) {
        // Si el gráfico ya existe, actualiza sus datos
        inventoryChartInstance.data.datasets[0].data = [stockData, soldData];
        inventoryChartInstance.update();
    } else {
        // Si no existe, crea una nueva instancia
        inventoryChartInstance = new Chart(ctx, chartConfig);
    }
}


// Exportar las funciones para que puedan ser usadas por script.js
window.chartManager = {
    drawSalesChart,
    drawInventoryChart
};