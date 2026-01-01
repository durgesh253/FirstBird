import { KPICard } from '../components/KPICard';
import { ChartComponent } from '../components/ChartComponent';
import { Table } from '../components/Table';
import { api } from '../services/api';

export function Analytics() {
    const container = document.createElement('div');
    container.className = 'flex flex-col gap-lg';

    const header = document.createElement('div');
    header.innerHTML = `
      <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--color-text-main);">Analytics</h1>
      <p class="text-muted">High-level insights and performance comparisons.</p>
    `;
    container.appendChild(header);

    const innerContent = document.createElement('div');
    innerContent.className = 'flex flex-col gap-lg';
    innerContent.innerHTML = '<div class="card p-lg text-center text-muted">Loading analytics...</div>';
    container.appendChild(innerContent);

    const loadData = () => {
        api.getAnalytics().then(data => {
            innerContent.innerHTML = '';

            // 1. KPI Cards
            const kpiGrid = document.createElement('div');
            kpiGrid.className = 'grid-cols-4';
            data.kpis.forEach(kpi => kpiGrid.appendChild(KPICard(kpi)));
            innerContent.appendChild(kpiGrid);

            // 2. Charts
            const chartsGrid = document.createElement('div');
            chartsGrid.className = 'grid-cols-2';

            // Revenue by Platform
            const platformCard = document.createElement('div');
            platformCard.className = 'card';
            platformCard.innerHTML = `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Revenue by Platform</h3>`;
            platformCard.appendChild(ChartComponent({
                type: 'bar',
                data: {
                    labels: data.platformRevenue.labels,
                    datasets: [{
                        label: 'Revenue',
                        data: data.platformRevenue.data,
                        backgroundColor: ['#4f46e5', '#E1306C', '#25D366', '#f59e0b', '#6b7280'],
                        borderRadius: 4
                    }]
                }
            }));
            chartsGrid.appendChild(platformCard);

            // Conversion Funnel
            const funnelCard = document.createElement('div');
            funnelCard.className = 'card';
            funnelCard.innerHTML = `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Conversion Funnel</h3>`;
            funnelCard.appendChild(ChartComponent({
                type: 'bar',
                data: {
                    labels: data.funnel.map(f => f.label),
                    datasets: [{
                        label: 'Count',
                        data: data.funnel.map(f => f.value),
                        backgroundColor: '#4f46e5',
                        indexAxis: 'y',
                        borderRadius: 4
                    }]
                },
                options: { indexAxis: 'y' }
            }));
            chartsGrid.appendChild(funnelCard);
            innerContent.appendChild(chartsGrid);

            // 3. Comparison Table
            const comparisonContainer = document.createElement('div');
            comparisonContainer.className = 'card';
            comparisonContainer.style.padding = '0';
            comparisonContainer.innerHTML = `<div style="padding: 1.25rem; border-bottom: 1px solid var(--color-border); font-weight: 600;">Platform Comparison</div>`;

            const columns = [
                { header: 'Platform', key: 'platform', render: row => `<span style="font-weight: 600;">${row.platform}</span>` },
                { header: 'Revenue', key: 'revenue', render: row => `₹${Number(row.revenue).toLocaleString()}` },
                { header: 'Orders', key: 'orders' },
                { header: 'AOV', key: 'aov', render: row => `₹${Number(row.aov).toLocaleString()}` },
                {
                    header: 'Conversion Rate', key: 'conv', render: row => {
                        const val = parseFloat(row.conv);
                        const color = val > 4 ? 'text-green-600' : (val < 2 ? 'text-red-600' : 'text-gray-600');
                        return `<span class="${color} font-semibold">${row.conv}</span>`;
                    }
                },
            ];

            const table = Table({ columns, data: data.comparison });
            comparisonContainer.appendChild(table);
            innerContent.appendChild(comparisonContainer);
        });
    };

    loadData();
    return container;
}
