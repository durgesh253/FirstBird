import { KPICard } from '../components/KPICard';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { api } from '../services/api';

export function Campaigns() {
    const container = document.createElement('div');
    container.className = 'flex flex-col gap-lg';

    container.innerHTML = `
    <div class="flex justify-end items-center" style="margin-bottom: 1rem;">
      <button id="newCampaignBtn" class="btn btn-primary"><i class="ph ph-plus" style="margin-right: 0.5rem;"></i> New Campaign</button>
    </div>
  `;

    // State Container
    const innerContent = document.createElement('div');
    innerContent.className = 'flex flex-col gap-lg';
    innerContent.innerHTML = '<div class="card p-lg text-center text-muted">Loading campaigns...</div>';
    container.appendChild(innerContent);

    // New Campaign Modal
    container.querySelector('#newCampaignBtn').onclick = () => {
        const modalContent = document.createElement('div');
        modalContent.className = 'flex flex-col gap-lg';
        modalContent.innerHTML = `
            <div class="form-group">
                <label class="form-label">Campaign Name</label>
                <input type="text" id="campaignName" class="input" placeholder="e.g. Summer Sale 2024">
            </div>
            <div class="form-group">
                <label class="form-label">Platform Source</label>
                <select id="platformSource" class="input">
                    <option>Instagram</option>
                    <option>WhatsApp</option>
                    <option>Email</option>
                    <option>Facebook</option>
                    <option>X / Twitter</option>
                    <option>Shopify</option>
                    <option>Offline</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Coupon Code (Optional)</label>
                <div style="position: relative;">
                    <input type="text" id="couponCode" class="input" placeholder="e.g. SUMMER10" style="padding-left: 2.5rem;">
                    <i class="ph ph-ticket" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted);"></i>
                </div>
                <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">This code will be tracked for lead conversions.</p>
            </div>
        `;

        const modal = Modal({
            title: 'Create New Campaign',
            confirmText: 'Create Campaign',
            content: modalContent,
            onConfirm: async () => {
                const name = modalContent.querySelector('#campaignName').value;
                const platformSource = modalContent.querySelector('#platformSource').value;
                const couponCode = modalContent.querySelector('#couponCode').value;

                if (!name) return alert('Campaign name is required');

                const res = await api.createCampaign({ name, platformSource, couponCode });
                if (res) {
                    alert('Campaign created!');
                    loadCampaigns();
                }
            }
        });
        document.body.appendChild(modal);
    };

    // Fetch Data
    const loadCampaigns = () => {
        innerContent.innerHTML = '<div class="card p-lg text-center text-muted">Loading campaigns...</div>';
        Promise.all([api.getCampaigns(), api.getCampaignStats()]).then(([campaigns, stats]) => {
            innerContent.innerHTML = '';

            // 1. KPI Section
            const kpiGrid = document.createElement('div');
            kpiGrid.className = 'grid-cols-4';
            kpiGrid.style.marginBottom = '1.5rem';

            const kpis = [
                { title: 'Total Campaigns', value: stats.totalCampaigns, trend: null, trendValue: null, icon: 'ph-megaphone', iconColor: 'primary' },
                { title: 'Active', value: stats.activeCampaigns, trend: null, trendValue: null, icon: 'ph-broadcast', iconColor: 'secondary' },
                { title: 'Platforms Used', value: stats.platformsUsed, trend: null, trendValue: null, icon: 'ph-globe', iconColor: 'warning' },
                { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, trend: 'up', trendValue: '+18%', icon: 'ph-currency-dollar', iconColor: 'secondary' },
            ];
            kpis.forEach(kpi => kpiGrid.appendChild(KPICard(kpi)));
            innerContent.appendChild(kpiGrid);

            // 2. Campaigns Table
            const tableContainer = document.createElement('div');
            innerContent.appendChild(tableContainer);

            const columns = [
                { header: 'Campaign Name', key: 'name', render: row => `<span style="font-weight: 500;">${row.name}</span>` },
                {
                    header: 'Platform', key: 'platform', render: row => {
                        let icon = 'ph-globe';
                        let color = '#6b7280';
                        if (row.platform === 'Instagram') { icon = 'ph-instagram-logo'; color = '#E1306C'; }
                        if (row.platform === 'WhatsApp') { icon = 'ph-whatsapp-logo'; color = '#25D366'; }
                        if (row.platform === 'Email') { icon = 'ph-envelope'; color = '#f59e0b'; }
                        if (row.platform === 'Facebook') { icon = 'ph-facebook-logo'; color = '#1877F2'; }
                        return `<span class="flex items-center gap-sm" style="color: ${color}"><i class="ph ${icon}"></i> <span style="color: var(--color-text-main)">${row.platform}</span></span>`;
                    }
                },
                { header: 'Code', key: 'code', render: row => row.code && row.code !== '-' ? `<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">${row.code}</code>` : '-' },
                { header: 'Leads', key: 'leads' },
                { header: 'Orders', key: 'orders' },
                { header: 'Revenue', key: 'revenue', render: row => `₹${Number(row.revenue).toLocaleString()}` },
                { header: 'Conversion', key: 'conv' },
                {
                    header: 'Status', key: 'status', render: row => {
                        const status = row.status || 'Active';
                        let style = 'padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #ecfdf5; color: #059669;';
                        if (status === 'Inactive') style = 'padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #f3f4f6; color: #6b7280;';
                        return `<span style="${style}">${status}</span>`;
                    }
                },
                {
                    header: 'Actions', key: 'actions', render: (row) => `
                        <div class="flex gap-sm">
                            <button class="btn-icon edit-btn" title="Edit Campaign" style="padding: 4px;"><i class="ph ph-pencil-simple" style="font-size: 1rem; color: var(--color-primary);"></i></button>
                            <button class="btn-icon delete-btn" title="Delete Campaign" style="padding: 4px;"><i class="ph ph-trash" style="font-size: 1rem; color: #dc2626;"></i></button>
                        </div>
                    `
                }
            ];

            const tableData = campaigns.map(camp => {
                const leads = camp._count ? camp._count.leads : 0;
                const orders = camp._count ? camp._count.orders : 0;
                const conv = leads > 0 ? Math.round((orders / leads) * 100) + '%' : '0%';

                return {
                    id: camp.id,
                    name: camp.name,
                    platform: camp.platformSource,
                    code: camp.coupon ? camp.coupon.code : '-',
                    leads: leads,
                    orders: orders,
                    revenue: camp.revenue || 0,
                    conv: conv,
                    status: camp.status || 'Active'
                };
            });

            if (tableData.length === 0) {
                tableContainer.innerHTML = '<div class="card p-lg text-center text-muted">No campaigns found. Create one to get started!</div>';
            } else {
                const table = Table({
                    columns,
                    data: tableData,
                    onRowClick: (item, event) => {
                        // Check if click was on action buttons
                        if (event.target.closest('.edit-btn')) {
                            handleEdit(item);
                            return;
                        }
                        if (event.target.closest('.delete-btn')) {
                            handleDelete(item);
                            return;
                        }
                        history.pushState({}, '', `/campaigns/detail?id=${item.id}`);
                        window.dispatchEvent(new Event('popstate'));
                    }
                });
                tableContainer.appendChild(table);
            }
        });
    };

    const handleEdit = (item) => {
        const modalContent = document.createElement('div');
        modalContent.className = 'flex flex-col gap-lg';
        modalContent.innerHTML = `
            <div class="form-group">
                <label class="form-label">Campaign Name</label>
                <input type="text" id="campaignName" class="input" value="${item.name}" placeholder="e.g. Summer Sale 2024">
            </div>
            <div class="form-group">
                <label class="form-label">Platform Source</label>
                <select id="platformSource" class="input">
                    <option ${item.platform === 'Instagram' ? 'selected' : ''}>Instagram</option>
                    <option ${item.platform === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
                    <option ${item.platform === 'Email' ? 'selected' : ''}>Email</option>
                    <option ${item.platform === 'Facebook' ? 'selected' : ''}>Facebook</option>
                    <option ${item.platform === 'X / Twitter' ? 'selected' : ''}>X / Twitter</option>
                    <option ${item.platform === 'Shopify' ? 'selected' : ''}>Shopify</option>
                    <option ${item.platform === 'Offline' ? 'selected' : ''}>Offline</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Coupon Code (Optional)</label>
                <div style="position: relative;">
                    <input type="text" id="couponCode" class="input" value="${item.code === '-' ? '' : item.code}" placeholder="e.g. SUMMER10" style="padding-left: 2.5rem;">
                    <i class="ph ph-ticket" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted);"></i>
                </div>
            </div>
        `;

        const modal = Modal({
            title: 'Edit Campaign',
            confirmText: 'Save Changes',
            content: modalContent,
            onConfirm: async () => {
                const name = modalContent.querySelector('#campaignName').value;
                const platformSource = modalContent.querySelector('#platformSource').value;
                const couponCode = modalContent.querySelector('#couponCode').value;

                const res = await api.updateCampaign(item.id, { name, platformSource, couponCode });
                if (res) {
                    alert('Campaign updated successfully');
                    loadCampaigns();
                }
            }
        });
        document.body.appendChild(modal);
    };

    const handleDelete = (item) => {
        if (confirm(`Are you sure you want to delete the campaign "${item.name}"? This will also delete associated leads.`)) {
            api.deleteCampaign(item.id).then(res => {
                if (res?.success) {
                    alert('Campaign deleted');
                    loadCampaigns();
                }
            });
        }
    };

    loadCampaigns();
    return container;
}
