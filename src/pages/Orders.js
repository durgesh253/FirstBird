import { KPICard } from '../components/KPICard';
import { Table } from '../components/Table';
import { Drawer } from '../components/Drawer';
import { api } from '../services/api';

export function Orders() {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-lg';

  let currentYear = '';
  let currentMonth = '';
  let searchQuery = '';
  let selectedCoupon = '';

  const headerContainer = document.createElement('div');
  container.appendChild(headerContainer);

  const innerContent = document.createElement('div');
  innerContent.className = 'flex flex-col gap-lg';
  container.appendChild(innerContent);

  const renderHeader = (monthOptions) => {
    // Filter to show only months with available data
    const availableMonths = monthOptions.filter(m => m.value);
    const currentMonthValue = currentYear + '-' + currentMonth;

    headerContainer.innerHTML = `
      <div class="flex justify-between items-center" style="margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--color-text-main);">Orders</h1>
          <p class="text-muted">Track all orders generated from coupons & campaigns.</p>
        </div>
        <div class="flex gap-md items-center">
          <select id="monthFilter" class="btn" style="background: white; border: 1px solid var(--color-border); padding: 0.5rem 1rem; cursor: pointer; border-radius: 8px;">
            ${availableMonths.map(m => `<option value="${m.value}" ${currentMonthValue === m.value ? 'selected' : ''}>${m.label}</option>`).join('')}
          </select>
          <button class="btn btn-primary"><i class="ph ph-download-simple" style="margin-right: 0.5rem;"></i> Export CSV</button>
        </div>
      </div>
    `;

    const selector = headerContainer.querySelector('#monthFilter');
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
    innerContent.innerHTML = '<div class="card p-lg text-center text-muted">Loading data...</div>';

    const filters = {};
    if (currentMonth && currentYear) {
      filters.month = currentMonth;
      filters.year = currentYear;
    }

    Promise.all([
      api.getOrders(filters),
      api.getStats(filters)
    ]).then(([orders, stats]) => {
      innerContent.innerHTML = '';

      // 1. KPI Section
      const kpiGrid = document.createElement('div');
      kpiGrid.className = 'grid-cols-4';
      const kpis = [
        { title: 'Total Orders', value: (stats?.totalOrders || 0).toLocaleString(), trend: null, trendValue: null, icon: 'ph-shopping-cart', iconColor: 'primary' },
        { title: 'From Coupons', value: (stats?.ordersFromCoupons || 0).toLocaleString(), trend: null, trendValue: null, icon: 'ph-ticket', iconColor: 'secondary' },
        { title: 'From Campaigns', value: (stats?.ordersFromCampaigns || 0).toLocaleString(), trend: null, trendValue: null, icon: 'ph-megaphone', iconColor: 'warning' },
        { title: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, trend: null, trendValue: null, icon: 'ph-currency-dollar', iconColor: 'secondary' },
      ];
      kpis.forEach(kpi => kpiGrid.appendChild(KPICard(kpi)));
      innerContent.appendChild(kpiGrid);

      // Create table container (must be before filters)
      const tableContainer = document.createElement('div');
      innerContent.appendChild(tableContainer);

      // Search and Filter Section
      const filterSection = document.createElement('div');
      filterSection.className = 'flex gap-md items-center';
      filterSection.style.marginBottom = '1.5rem';

      // Get unique coupons for dropdown
      const uniqueCoupons = [...new Set(orders.map(o => o.couponCode).filter(Boolean))];

      // Search Input
      const searchContainer = document.createElement('div');
      searchContainer.style.position = 'relative';
      searchContainer.style.flex = '1';
      searchContainer.style.maxWidth = '400px';
      searchContainer.innerHTML = `
        <input 
          type="text" 
          id="orders-search" 
          class="input" 
          placeholder="Search by order ID, customer, phone..." 
          style="padding-left: 2.5rem; width: 100%;"
          value="${searchQuery}"
        />
        <i class="ph ph-magnifying-glass" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted);"></i>
      `;
      filterSection.appendChild(searchContainer);

      // Coupon Dropdown
      const couponContainer = document.createElement('div');
      couponContainer.innerHTML = `
        <select id="coupon-filter" class="input" style="padding-right: 2.5rem; min-width: 180px;">
          <option value="">All Coupons</option>
          ${uniqueCoupons.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
      `;
      filterSection.appendChild(couponContainer);

      innerContent.insertBefore(filterSection, tableContainer);

      // Filter function
      const getFilteredOrders = (ordersData) => {
        let filtered = ordersData;

        // Apply coupon filter
        if (selectedCoupon) {
          filtered = filtered.filter(order => order.coupon === selectedCoupon);
        }

        // Apply search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(order =>
            (order.id && String(order.id).toLowerCase().includes(query)) ||
            (order.customer && order.customer.toLowerCase().includes(query)) ||
            (order.phone && order.phone.toLowerCase().includes(query))
          );
        }

        return filtered;
      };

      // Columns Definition
      const columns = [
        { header: 'Order ID', key: 'id', render: row => `<span style="font-weight: 600;">#${row.id}</span>` },
        {
          header: 'Date & Time',
          key: 'date',
          render: row => `
            <div class="flex flex-col">
              <span class="text-sm" style="font-weight: 500;">${row.date}</span>
              <span class="text-xs text-muted">${row.time}</span>
            </div>
          `
        },
        {
          header: 'Customer',
          key: 'customer',
          render: row => `
            <div class="flex flex-col">
              <span style="font-weight: 500;">${row.customer}</span>
              <span class="text-xs text-muted">${row.phone || '-'}</span>
            </div>
          `
        },
        {
          header: 'Source', key: 'platform', render: row => {
            let icon = 'ph-globe';
            if (row.platform === 'Instagram') icon = 'ph-instagram-logo';
            if (row.platform === 'Email') icon = 'ph-envelope';
            if (row.platform === 'WhatsApp') icon = 'ph-whatsapp-logo';
            return `<span class="flex items-center gap-sm text-sm"><i class="ph ${icon}"></i> ${row.platform}</span>`
          }
        },
        { header: 'Campaign', key: 'campaign', render: row => `<span class="text-sm">${row.campaign}</span>` },
        { header: 'Coupon', key: 'coupon', render: row => row.coupon ? `<span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-family: monospace;">${row.coupon}</span>` : '-' },
        { header: 'Value', key: 'value', render: row => `<span style="font-weight: 600;">₹${Number(row.value).toLocaleString()}</span>` },
        {
          header: 'Status', key: 'status', render: row => {
            return `<span style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #ecfdf5; color: #059669;">Paid</span>`;
          }
        },
      ];

      const tableData = orders.map(order => {
        const d = new Date(order.shopifyCreatedAt);
        return {
          id: order.shopifyOrderId,
          date: d.toLocaleDateString(),
          time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          customer: order.customerName || order.customerEmail || 'Guest',
          phone: order.customerPhone,
          platform: order.platformSource,
          campaign: order.campaign ? order.campaign.name : '-',
          coupon: order.couponCode,
          value: order.totalAmount,
          status: 'Paid'
        };
      });

      // Render table with filtered data
      const renderTable = () => {
        tableContainer.innerHTML = '';
        const filteredTableData = getFilteredOrders(tableData);

        if (filteredTableData.length === 0) {
          tableContainer.innerHTML = '<div class="card p-lg text-center text-muted">No orders found for this period.</div>';
          return;
        }

        const table = Table({
          columns,
          data: filteredTableData,
          onRowClick: (item) => {
            const drawerContent = document.createElement('div');
            drawerContent.innerHTML = `
                  <div class="flex flex-col gap-lg">
                    <div class="flex justify-between items-start">
                      <div>
                        <div class="text-muted text-sm">Order ID</div>
                        <div class="font-semibold text-xl">#${item.id}</div>
                      </div>
                      <div class="text-right">
                        <div class="text-muted text-sm">Date</div>
                        <div>${item.date}</div>
                      </div>
                    </div>
                    
                  <div style="padding: 1rem; background: var(--color-bg); border-radius: 8px;">
                    <h4 class="font-semibold mb-lg">Attribution Path</h4>
                    <div class="flex items-center gap-md text-sm">
                      <span class="flex items-center gap-sm"><i class="ph ph-globe"></i> ${item.platform}</span>
                      <i class="ph ph-arrow-right text-muted"></i>
                      <span>${item.campaign}</span>
                      <i class="ph ph-arrow-right text-muted"></i>
                      <span style="font-family: monospace;">${item.coupon || '-'}</span>
                    </div>
                  </div>

                  <div class="grid-cols-2">
                    <div>
                      <h4 class="font-semibold mb-md">Customer</h4>
                       <div class="flex items-center gap-md">
                          <div style="width: 40px; height: 40px; background: #e0e7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--color-primary); font-weight: 600;">${item.customer.charAt(0)}</div>
                          <div>
                            <div class="font-medium">${item.customer}</div>
                            <div class="text-xs text-muted">${item.phone || 'No phone'}</div>
                          </div>
                       </div>
                    </div>
                    <div>
                      <h4 class="font-semibold mb-md">Status</h4>
                      <div class="flex items-center gap-sm">
                        <span style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; background: #ecfdf5; color: #059669;">Paid</span>
                      </div>
                    </div>
                  </div>

                   <div>
                    <h4 class="font-semibold mb-md">Line Items</h4>
                    <div class="flex flex-col gap-sm">
                      ${(orders.find(o => o.shopifyOrderId === item.id)?.lineItems || 'No items listed').split(', ').map(item => `
                        <div class="flex justify-between items-center py-xs border-b">
                          <span class="text-sm">${item}</span>
                        </div>
                      `).join('')}
                    </div>
                     <div class="flex justify-between items-center py-sm font-semibold" style="margin-top: 1rem;">
                      <span>Total Amount</span>
                      <span>₹${Number(item.value).toLocaleString()}</span>
                    </div>
                  </div>
                  </div>
                `;
            const drawer = Drawer({
              title: 'Order Details',
              content: drawerContent
            });
            document.body.appendChild(drawer);
          }
        });
        tableContainer.appendChild(table);
      };

      // Initial render
      renderTable();

      // Event listener for search and coupon filter
      setTimeout(() => {
        const searchInput = document.getElementById('orders-search');
        const couponFilter = document.getElementById('coupon-filter');

        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderTable();
          });
        }

        if (couponFilter) {
          couponFilter.addEventListener('change', (e) => {
            selectedCoupon = e.target.value;
            renderTable();
          });
        }
      }, 0);
    });
  };

  // Initial setup: fetch months then initial data
  api.getOrderMonths().then(months => {
    if (months && months.length > 0) {
      // Use the latest available month from data
      const latest = months[0];
      const [y, m] = latest.value.split('-');
      currentYear = y;
      currentMonth = m;
    } else {
      // Fallback to current real month
      const now = new Date();
      currentYear = String(now.getFullYear());
      currentMonth = String(now.getMonth() + 1);
    }

    renderHeader(months);
    loadData();
  });

  return container;
}
