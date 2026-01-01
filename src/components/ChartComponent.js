import Chart from 'chart.js/auto';

export function ChartComponent({ type, data, options, height = '300px' }) {
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.height = height;
    container.style.width = '100%';

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    // Defer chart creation until mounted (simplistic approach)
    // In a real framework we'd use useEffect. Here we rely on the caller to ensure DOM integration or immediate execution.
    setTimeout(() => {
        new Chart(canvas, {
            type,
            data,
            options: {
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    }
                },
                scales: type === 'doughnut' ? {} : {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: { family: 'Inter' }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: 'Inter' }
                        }
                    }
                },
                ...options
            }
        });
    }, 0);

    return container;
}
