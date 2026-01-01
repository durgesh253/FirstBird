import { KPICard } from '../components/KPICard';
import { ChartComponent } from '../components/ChartComponent';
import { TopPerformers } from '../components/TopPerformers';
import { api } from '../services/api';

export function Dashboard() {
    const container = document.createElement('div');
    container.className = 'flex flex-col gap-lg';

    let currentYear = '';
    let currentMonth = '';

    const header = document.createElement('div');
    container.appendChild(header);

    const innerContent = document.createElement('div');
    innerContent.className = 'flex flex-col gap-lg';
    container.appendChild(innerContent);

    const renderHeader = (monthOptions) => {
        header.innerHTML = `
        <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
            <div>
                <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--color-text-main);">Dashboard</h1>
                <p class="text-muted">Overview of your store's performance.</p>
            </div>
            <div class="flex gap-md items-center">
                <select id="monthFilter" class="btn" style="background: white; border: 1px solid var(--color-border); padding: 0.5rem 1rem; cursor: pointer; border-radius: 8px;">
                    <option value="">All Time</option>
                    ${monthOptions.map(m => `<option value="${m.value}" ${currentYear + '-' + currentMonth === m.value ? 'selected' : ''}>${m.label}</option>`).join('')}
                </select>
            </div>
        </div>
        `;
        const selector = header.querySelector('#monthFilter');
        selector.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val) {
                const [y, m] = val.split('-');
                currentYear = y;
                currentMonth = m;
            } else {
                currentYear = '';
                currentMonth = '';
            }
            loadData();
        });
    };

    const loadData = () => {
        innerContent.innerHTML = '<div class="card p-lg text-center text-muted">Loading metrics...</div>';

        const filters = {};
        if (currentMonth && currentYear) {
            filters.month = currentMonth;
            filters.year = currentYear;
        }

        api.getStats(filters).then(stats => {
            innerContent.innerHTML = '';
            if (!stats) {
                innerContent.innerHTML = '<div class="card p-lg text-center text-muted">Failed to load stats. Check if backend is running.</div>';
                return;
            }

            // 2. KPI Section
            const kpiGrid = document.createElement('div');
            kpiGrid.className = 'grid-cols-4';

            const kpis = [
                { title: 'Total Orders', value: stats.totalOrders.toLocaleString(), trend: 'up', trendValue: '+12%', icon: 'ph-shopping-cart', iconColor: 'primary' },
                { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, trend: 'up', trendValue: '+8.5%', icon: 'ph-currency-dollar', iconColor: 'secondary' },
                { title: 'Orders from Coupons', value: stats.ordersFromCoupons.toLocaleString(), trend: 'up', trendValue: '+15%', icon: 'ph-ticket', iconColor: 'primary' },
                { title: 'Conversion Rate', value: `${stats.conversionRate}%`, trend: 'down', trendValue: '-1.2%', icon: 'ph-percent', iconColor: 'warning' },
            ];

            kpis.forEach(kpi => kpiGrid.appendChild(KPICard(kpi)));
            innerContent.appendChild(kpiGrid);

            // 3. Middle Section: Charts & Top Performers
            const middleSection = document.createElement('div');
            middleSection.style.display = 'grid';
            middleSection.style.gridTemplateColumns = '2fr 1fr'; // 2/3 Charts, 1/3 Top Performers
            middleSection.style.gap = 'var(--spacing-lg)';

            // Charts Container
            const chartsContainer = document.createElement('div');
            chartsContainer.className = 'flex flex-col gap-lg';

            // Revenue Chart
            const revenueCard = document.createElement('div');
            revenueCard.className = 'card';
            revenueCard.innerHTML = `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Revenue Tracking</h3>`;

            const chartLabels = stats.revenueByDay?.map(d => d.date) || ['No Data'];
            const chartDataValues = stats.revenueByDay?.map(d => d.revenue) || [0];

            const revenueChart = ChartComponent({
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Revenue',
                            data: chartDataValues,
                            borderColor: '#4f46e5',
                            backgroundColor: 'rgba(79, 70, 229, 0.1)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    interaction: { mode: 'index', intersect: false }
                }
            });
            revenueCard.appendChild(revenueChart);
            chartsContainer.appendChild(revenueCard);

            // Revenue Source (Donut)
            const organicOrders = stats.totalOrders - stats.ordersFromCoupons - stats.ordersFromCampaigns;
            const attributionCard = document.createElement('div');
            attributionCard.className = 'card';
            attributionCard.innerHTML = `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Order Sources</h3>`;
            const attributionChart = ChartComponent({
                type: 'doughnut',
                height: '250px',
                data: {
                    labels: ['Campaigns', 'Coupons', 'Organic'],
                    datasets: [{
                        data: [stats.ordersFromCampaigns, stats.ordersFromCoupons, Math.max(0, organicOrders)],
                        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    cutout: '70%',
                    plugins: { legend: { position: 'right' } }
                }
            });
            attributionCard.appendChild(attributionChart);
            chartsContainer.appendChild(attributionCard);

            middleSection.appendChild(chartsContainer);
            middleSection.appendChild(TopPerformers(stats.topPerformers));

            innerContent.appendChild(middleSection);
        });
    };

    api.getOrderMonths().then(months => {
        if (months.length > 0) {
            const [y, m] = months[0].value.split('-');
            currentYear = y;
            currentMonth = m;
        }
        renderHeader(months);
        loadData();
    });

    return container;
}
