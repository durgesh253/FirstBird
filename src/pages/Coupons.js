import { KPICard } from '../components/KPICard';
import { ChartComponent } from '../components/ChartComponent';
import { Table } from '../components/Table';
import { Drawer } from '../components/Drawer';
import { api } from '../services/api';

export function Coupons() {
    const container = document.createElement('div');
    container.className = 'flex flex-col gap-lg';

    // Header
    container.innerHTML = `
    <div class="flex justify-between items-center">
      <div>
        <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--color-text-main);">Coupons</h1>
        <p class="text-muted">Manage and track your coupon performance.</p>
      </div>
      <button class="btn btn-primary"><i class="ph ph-plus" style="margin-right: 0.5rem;"></i> New Coupon</button>
    </div>
  `;

    // State/Loading container
    const content = document.createElement('div');
    content.className = 'flex flex-col gap-lg';
    content.innerHTML = '<div class="card p-lg text-center text-muted">Loading coupon data...</div>';
    container.appendChild(content);

    // Fetch Data
    api.getCoupons().then(coupons => {
        content.innerHTML = '';
        if (coupons.length === 0) {
            content.innerHTML = '<div class="card p-lg text-center text-muted">No coupons found. Try syncing your Shopify data.</div>';
            return;
        }

        // Calculations for KPIs
        const totalActive = coupons.length;
        const totalRevenue = coupons.reduce((sum, c) => sum + Number(c.totalRevenue), 0);
        const totalOrders = coupons.reduce((sum, c) => sum + c.ordersCount, 0);
        const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';

        // KPI Section
        const kpiGrid = document.createElement('div');
        kpiGrid.className = 'grid-cols-4';
        const kpis = [
            { title: 'Active Coupons', value: totalActive, trend: null, trendValue: null, icon: 'ph-ticket', iconColor: 'primary' },
            { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, trend: 'up', trendValue: '+15%', icon: 'ph-currency-dollar', iconColor: 'secondary' },
            { title: 'Avg Order Value', value: `₹${avgOrderValue}`, trend: 'down', trendValue: '-2%', icon: 'ph-shopping-cart', iconColor: 'warning' },
            { title: 'Redemption Rate', value: '42%', trend: 'up', trendValue: '+5%', icon: 'ph-percent', iconColor: 'primary' },
        ];
        kpis.forEach(kpi => kpiGrid.appendChild(KPICard(kpi)));
        content.appendChild(kpiGrid);

        // Chart
        const chartCard = document.createElement('div');
        chartCard.className = 'card';
        chartCard.innerHTML = `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Revenue per Coupon (All Time)</h3>`;

        // Sort all coupons by revenue descending, show top 15
        const chartData = coupons.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 15);

        const chart = ChartComponent({
            type: 'bar',
            height: '400px',
            data: {
                labels: chartData.map(c => c.code),
                datasets: [{
                    label: 'Revenue (₹)',
                    data: chartData.map(c => c.totalRevenue),
                    backgroundColor: '#4f46e5',
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: { beginAtZero: true }
                },
                plugins: {
                    legend: { display: true }
                }
            }
        });
        chartCard.appendChild(chart);
        content.appendChild(chartCard);

        // Current Month Section
        const currentMonthCard = document.createElement('div');
        currentMonthCard.className = 'card';
        currentMonthCard.innerHTML = `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Current Month Performance</h3>`;

        const currentMonthData = coupons
            .filter(c => c.currentMonthRevenue > 0)
            .sort((a, b) => b.currentMonthRevenue - a.currentMonthRevenue)
            .slice(0, 10);

        const currentMonthChart = ChartComponent({
            type: 'bar',
            height: '300px',
            data: {
                labels: currentMonthData.length > 0 ? currentMonthData.map(c => c.code) : ['No data'],
                datasets: [{
                    label: 'Current Month Revenue (₹)',
                    data: currentMonthData.length > 0 ? currentMonthData.map(c => c.currentMonthRevenue) : [0],
                    backgroundColor: '#10b981',
                    borderRadius: 4
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
        currentMonthCard.appendChild(currentMonthChart);
        content.appendChild(currentMonthCard);

        // Table - Show ALL coupons
        const tableData = coupons.map(c => ({
            code: c.code,
            status: c.status || 'Active',
            orders: c.ordersCount ?? 0,
            revenue: `₹${(Number(c.totalRevenue) || 0).toLocaleString()}`,
            monthRevenue: `₹${(Number(c.currentMonthRevenue) || 0).toLocaleString()}`,
            trend: 'stable',
            last: c.lastUsed ? new Date(c.lastUsed).toLocaleDateString() : 'Never'
        }));

        const columns = [
            { header: 'Coupon Code', key: 'code', render: (row) => `<span style="font-weight: 600;">${row.code}</span>` },
            {
                header: 'Status', key: 'status', render: (row) => {
                    return `<span style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #ecfdf5; color: #059669">${row.status}</span>`
                }
            },
            { header: 'Orders (All Time)', key: 'orders' },
            { header: 'Revenue (All Time)', key: 'revenue' },
            { header: 'This Month', key: 'monthRevenue' },
            {
                header: 'Trend', key: 'trend', render: (row) => {
                    const icon = row.trend === 'up' ? 'ph-trend-up' : (row.trend === 'down' ? 'ph-trend-down' : 'ph-minus');
                    const color = row.trend === 'up' ? '#10b981' : (row.trend === 'down' ? '#ef4444' : '#6b7280');
                    return `<i class="ph ${icon}" style="color: ${color}"></i>`;
                }
            },
            { header: 'Last Used', key: 'last', render: (row) => `<span class="text-muted text-sm">${row.last}</span>` },
        ];

        const table = Table({
            columns,
            data: tableData,
            onRowClick: (item) => {
                history.pushState({}, '', `/coupons/${item.code}`);
                window.dispatchEvent(new Event('popstate'));
            }
        });
        content.appendChild(table);
    });

    return container;
}
