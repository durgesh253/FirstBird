import { KPICard } from '../components/KPICard';
import { Table } from '../components/Table';
import { api } from '../services/api';

export function CouponDetail() {
    const container = document.createElement('div');
    container.className = 'flex flex-col gap-lg';

    const path = window.location.pathname;
    const code = path.split('/').pop();

    // Breadcrumb / Back
    const backBtn = document.createElement('button');
    backBtn.className = 'btn';
    backBtn.style.alignSelf = 'flex-start';
    backBtn.style.paddingLeft = '0';
    backBtn.style.color = 'var(--color-text-muted)';
    backBtn.innerHTML = `<i class="ph ph-arrow-left"></i> Back to Coupons`;
    backBtn.onclick = () => {
        history.pushState({}, '', '/coupons');
        window.dispatchEvent(new Event('popstate'));
    };
    container.appendChild(backBtn);

    // Initial Loading State
    const content = document.createElement('div');
    content.className = 'flex flex-col gap-lg';
    content.innerHTML = '<div class="card p-lg text-center text-muted">Loading coupon details...</div>';
    container.appendChild(content);

    // Fetch Coupon Details
    api.getCouponDetails(code).then(details => {
        content.innerHTML = '';
        if (!details) {
            content.innerHTML = '<div class="card p-lg text-center text-muted">Coupon not found.</div>';
            return;
        }

        // 1. Header Card
        const header = document.createElement('div');
        header.className = 'card flex justify-between items-center';
        header.innerHTML = `
        <div class="flex items-center gap-lg">
          <div style="width: 64px; height: 64px; border-radius: 12px; background: #EEF2FF; color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 2rem;">
            <i class="ph ph-ticket"></i>
          </div>
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 700;">${details.coupon_code}</h1>
            <div class="flex gap-md text-sm text-muted" style="margin-top: 0.25rem;">
              <span><i class="ph ph-calendar"></i> Total History</span>
              <span class="text-green-600 bg-green-50" style="padding: 2px 8px; border-radius: 4px;">Active</span>
            </div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm text-muted">Total Generated Revenue</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-secondary);">₹${(details.recent_orders?.reduce((sum, o) => sum + o.amount, 0) || 0).toLocaleString()}</div>
        </div>
      `;
        content.appendChild(header);

        // 2. KPI Section (Calculated from orders if not provided by backend)
        const totalRev = details.recent_orders?.reduce((sum, o) => sum + o.amount, 0) || 0;
        const totalOrders = details.recent_orders?.length || 0;
        const avgOrder = totalOrders > 0 ? (totalRev / totalOrders).toFixed(2) : 0;

        const kpiGrid = document.createElement('div');
        kpiGrid.className = 'grid-cols-3';
        const kpis = [
            { title: 'Total Revenue', value: `₹${totalRev.toLocaleString()}`, icon: 'ph-currency-dollar', iconColor: 'secondary' },
            { title: 'Total Orders', value: totalOrders, icon: 'ph-shopping-cart', iconColor: 'primary' },
            { title: 'Avg Order Value', value: `₹${avgOrder}`, icon: 'ph-chart-line', iconColor: 'warning' },
        ];
        kpis.forEach(kpi => kpiGrid.appendChild(KPICard(kpi)));
        content.appendChild(kpiGrid);

        // 3. Associated Orders Table
        const tableCard = document.createElement('div');
        tableCard.className = 'card';
        tableCard.innerHTML = `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem;">Associated Orders</h3>`;

        const ordersTable = Table({
            columns: [
                { header: 'Order ID', key: 'id', render: r => `<span style="font-weight: 600;">#${r.id}</span>` },
                { header: 'Date', key: 'date', render: r => `<span class="text-sm text-muted">${new Date(r.date).toLocaleDateString()}</span>` },
                {
                    header: 'Customer',
                    key: 'customer',
                    render: r => `
                    <div class="flex flex-col">
                        <span class="font-medium">${r.name || 'Guest'}</span>
                        <span class="text-xs text-muted">${r.phone || r.email || ''}</span>
                    </div>
                  `
                },
                {
                    header: 'Products',
                    key: 'lineItems',
                    render: r => `<span class="text-sm" title="${r.lineItems}">${r.lineItems ? (r.lineItems.length > 50 ? r.lineItems.substring(0, 50) + '...' : r.lineItems) : '-'}</span>`
                },
                { header: 'Revenue', key: 'amount', render: r => `<span style="font-weight: 600;">₹${r.amount.toLocaleString()}</span>` },
                {
                    header: 'Status', key: 'status', render: () => `
                        <span style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #ecfdf5; color: #059669">Paid</span>
                    `
                },
            ],
            data: details.recent_orders?.map(o => ({
                ...o,
                name: o.customerName || 'Guest' // Fallback for backend data structure
            })) || []
        });

        tableCard.appendChild(ordersTable);
        content.appendChild(tableCard);
    });

    return container;
}
