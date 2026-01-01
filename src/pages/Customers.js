import { KPICard } from '../components/KPICard';
import { Table } from '../components/Table';
import { Drawer } from '../components/Drawer';

export function Customers() {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-lg';

  container.innerHTML = `
    <div class="flex justify-between items-center">
      <div>
        <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--color-text-main);">Customers</h1>
        <p class="text-muted">Understand who your buyers are and where they came from.</p>
      </div>
    </div>
  `;

  // KPI Section
  const kpiGrid = document.createElement('div');
  kpiGrid.className = 'grid-cols-4';
  const kpis = [
    { title: 'Total Customers', value: '3,240', trend: 'up', trendValue: '+150', icon: 'ph-users', iconColor: 'primary' },
    { title: 'New This Month', value: '450', trend: 'up', trendValue: '+12%', icon: 'ph-user-plus', iconColor: 'secondary' },
    { title: 'Repeat Rate', value: '28%', trend: 'up', trendValue: '+2%', icon: 'ph-arrows-clockwise', iconColor: 'warning' },
    { title: 'Avg LTV', value: '₹340', trend: 'up', trendValue: '+15%', icon: 'ph-money', iconColor: 'secondary' },
  ];
  kpis.forEach(kpi => kpiGrid.appendChild(KPICard(kpi)));
  container.appendChild(kpiGrid);

  // Customers Table
  const tableData = [
    { name: 'Sarah Connor', email: 'sarah@skynet.com', source: 'Instagram', campaign: 'Summer Sale', orders: 12, revenue: '₹1,240', lastOrder: '2 days ago' },
    { name: 'Kyle Reese', email: 'kyle@resistance.org', source: 'Search', campaign: '-', orders: 3, revenue: '₹145', lastOrder: '5 hours ago' },
    { name: 'Ellen Ripley', email: 'ripley@nostromo.ship', source: 'WhatsApp', campaign: 'Win Back', orders: 8, revenue: '₹890', lastOrder: '1 week ago' },
    { name: 'Rick Deckard', email: 'rick@lapd.gov', source: 'Email', campaign: 'Welcome', orders: 1, revenue: '₹120', lastOrder: '1 month ago' },
  ];

  const columns = [
    {
      header: 'Customer', key: 'name', render: row => `
      <div class="flex items-center gap-md">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.75rem;">${row.name.charAt(0)}</div>
        <div>
          <div class="font-medium">${row.name}</div>
          <div class="text-sm text-muted">${row.email}</div>
        </div>
      </div>
    `},
    { header: 'First Source', key: 'source', render: row => `<span class="text-sm">${row.source}</span>` },
    { header: 'Campaign', key: 'campaign', render: row => `<span class="text-sm">${row.campaign}</span>` },
    { header: 'Orders', key: 'orders' },
    { header: 'Total Revenue', key: 'revenue', render: row => `<span class="font-semibold">${row.revenue}</span>` },
    { header: 'Last Order', key: 'lastOrder', render: row => `<span class="text-sm text-muted">${row.lastOrder}</span>` },
  ];

  const table = Table({
    columns,
    data: tableData,
    onRowClick: (item) => {
      const drawerContent = document.createElement('div');
      drawerContent.innerHTML = `
          <div class="flex flex-col gap-lg">
            <div class="flex items-center gap-lg border-b pb-lg">
               <div style="width: 64px; height: 64px; border-radius: 50%; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.5rem;">${item.name.charAt(0)}</div>
               <div>
                  <h3 class="font-bold text-xl">${item.name}</h3>
                  <div class="text-muted">${item.email}</div>
                  <div class="flex gap-sm mt-sm">
                    <span class="text-xs bg-gray-100 px-2 py-1 rounded">Los Angeles, USA</span>
                  </div>
               </div>
            </div>

            <div class="grid-cols-2" style="display:grid; gap: 1rem;">
               <div class="card p-md">
                 <div class="text-muted text-sm">Lifetime Value</div>
                 <div class="font-bold text-xl">${item.revenue}</div>
               </div>
               <div class="card p-md">
                 <div class="text-muted text-sm">Total Orders</div>
                 <div class="font-bold text-xl">${item.orders}</div>
               </div>
            </div>

            <div>
              <h4 class="font-semibold mb-md">Acquisition</h4>
              <div class="card p-md bg-gray-50 flex flex-col gap-sm">
                 <div class="flex justify-between">
                    <span class="text-muted">Source</span>
                    <span class="font-medium">${item.source}</span>
                 </div>
                 <div class="flex justify-between">
                    <span class="text-muted">Campaign</span>
                    <span class="font-medium">${item.campaign}</span>
                 </div>
              </div>
            </div>
          </div>
        `;
      const drawer = Drawer({ title: 'Customer Profile', content: drawerContent });
      document.body.appendChild(drawer);
    }
  });

  container.appendChild(table);

  return container;
}
