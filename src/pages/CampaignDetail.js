import { KPICard } from '../components/KPICard';
import { ChartComponent } from '../components/ChartComponent';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { api } from '../services/api';

export function CampaignDetail() {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-lg';

  // Get ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');

  // Breadcrumb / Back
  const backBtn = document.createElement('button');
  backBtn.className = 'btn';
  backBtn.style.alignSelf = 'flex-start';
  backBtn.style.paddingLeft = '0';
  backBtn.style.color = 'var(--color-text-muted)';
  backBtn.innerHTML = `<i class="ph ph-arrow-left"></i> Back to Campaigns`;
  backBtn.onclick = () => {
    history.pushState({}, '', '/campaigns');
    window.dispatchEvent(new Event('popstate'));
  };
  container.appendChild(backBtn);

  const innerContent = document.createElement('div');
  innerContent.className = 'flex flex-col gap-lg';
  innerContent.innerHTML = '<div class="card p-lg text-center text-muted">Loading campaign details...</div>';
  container.appendChild(innerContent);

  // Define openEditLeadModal function with closure access to loadDetails
  let currentDetails = null;
  let loadDetailsFunc = null;

  const openEditLeadModal = (lead, currentCouponCode) => {
    const content = document.createElement('div');
    content.className = 'flex flex-col gap-lg';
    content.innerHTML = `
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input type="text" id="edit-lead-name" class="input" value="${lead.name || ''}" placeholder="e.g. Shaurya Katiyar">
      </div>
      <div class="form-group">
        <label class="form-label">Phone Number</label>
        <input type="text" id="edit-lead-phone" class="input" value="${lead.phone || ''}" placeholder="e.g. 91639343199">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="edit-lead-status" class="input">
          <option value="PENDING" ${lead.status === 'PENDING' ? 'selected' : ''}>Pending</option>
          <option value="CONVERTED" ${lead.status === 'CONVERTED' ? 'selected' : ''}>Coupon Used</option>
          <option value="LOST" ${lead.status === 'LOST' ? 'selected' : ''}>Lost</option>
        </select>
      </div>
      <div class="form-group" style="padding-top: 0.5rem; border-top: 1px dashed var(--color-border);">
        <label class="form-label">Campaign Coupon Code</label>
        <div style="position: relative;">
            <input type="text" id="edit-campaign-coupon" class="input" value="${currentCouponCode || ''}" placeholder="e.g. SUMMER10" style="padding-left: 2.5rem;">
            <i class="ph ph-ticket" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted);"></i>
        </div>
        <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">
            <i class="ph ph-info"></i> Updating this will change the coupon for the entire campaign.
        </p>
      </div>
    `;

    const modal = Modal({
      title: 'Edit Details',
      confirmText: 'Save Changes',
      content,
      onConfirm: () => {
        const name = content.querySelector('#edit-lead-name').value.trim();
        const phone = content.querySelector('#edit-lead-phone').value.trim();
        const status = content.querySelector('#edit-lead-status').value;
        const newCouponCode = content.querySelector('#edit-campaign-coupon').value.trim();

        const updates = [api.updateLead(lead.id, { name, phone, status })];

        // If coupon changed, update campaign too
        if (newCouponCode !== currentCouponCode && currentDetails) {
          updates.push(api.updateCampaign(campaignId, { name: currentDetails.name, platformSource: currentDetails.platformSource, couponCode: newCouponCode }));
        }

        Promise.all(updates).then(() => {
          if (loadDetailsFunc) loadDetailsFunc();
        });
      }
    });
    document.body.appendChild(modal);
  };

  const loadDetails = () => {
    if (!campaignId) {
      innerContent.innerHTML = '<div class="card p-lg text-center text-muted">No campaign selected.</div>';
      return;
    }

    api.getCampaignDetails(campaignId).then(details => {
      innerContent.innerHTML = '';
      if (!details) {
        innerContent.innerHTML = '<div class="card p-lg text-center text-muted">Campaign not found.</div>';
        return;
      }

      // Store details for use in openEditLeadModal
      currentDetails = details;
      loadDetailsFunc = loadDetails;

      const { name, platformSource, coupon, stats, leads } = details;

      // Header Card Match
      const header = document.createElement('div');
      header.className = 'card flex justify-between items-center';

      let platformIcon = 'ph-globe';
      let platformColor = '#EEF2FF';
      let iconText = '#4f46e5';
      if (platformSource === 'Instagram') { platformIcon = 'ph-instagram-logo'; platformColor = '#FFF0F5'; iconText = '#E1306C'; }
      if (platformSource === 'WhatsApp') { platformIcon = 'ph-whatsapp-logo'; platformColor = '#F0FDF4'; iconText = '#22C55E'; }

      header.innerHTML = `
            <div class="flex items-center gap-lg">
              <div style="width: 64px; height: 64px; border-radius: 12px; background: ${platformColor}; color: ${iconText}; display: flex; align-items: center; justify-content: center; font-size: 2.25rem;">
                <i class="ph ${platformIcon}"></i>
              </div>
              <div>
                <h1 style="font-size: 1.5rem; font-weight: 700;">${name}</h1>
                <div class="flex gap-md text-sm text-muted" style="margin-top: 0.25rem;">
                  <span><i class="ph ph-globe"></i> ${platformSource}</span>
                  <span><i class="ph ph-ticket"></i> ${coupon?.code || '-'}</span>
                  <span style="padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 0.75rem; ${details.status === 'Active' ? 'background: #ecfdf5; color: #059669;' : 'background: #f3f4f6; color: #6b7280;'}">${details.status || 'Active'}</span>
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-muted">Total Revenue</div>
              <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-secondary);">₹${Number(stats.revenue).toLocaleString()}</div>
            </div>
          `;
      innerContent.appendChild(header);

      // Conversion Funnel Match
      const funnel = document.createElement('div');
      funnel.className = 'card';
      funnel.innerHTML = `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 2rem;">Conversion Funnel</h3>`;

      const funnelSteps = [
        { label: 'Uploaded Leads', value: stats.uploadedLeads, percent: '100%', color: 'primary' },
        { label: 'Valid Leads', value: stats.uploadedLeads, percent: '100%', color: 'primary' },
        { label: 'Orders', value: stats.orders, percent: stats.uploadedLeads > 0 ? Math.round((stats.orders / stats.uploadedLeads) * 100) + '%' : '0%', color: 'secondary' },
        { label: 'Revenue', value: '₹' + (stats.revenue > 1000 ? (stats.revenue / 1000).toFixed(1) + 'k' : stats.revenue), percent: '-', color: 'secondary' }
      ];

      const stepsContainer = document.createElement('div');
      stepsContainer.style.display = 'flex';
      stepsContainer.style.justifyContent = 'space-around';
      stepsContainer.style.alignItems = 'center';

      funnelSteps.forEach((step, index) => {
        const stepEl = document.createElement('div');
        stepEl.style.textAlign = 'center';
        stepEl.innerHTML = `
                    <div style="font-size: 2.5rem; font-weight: 800; color: var(--color-${step.color}); margin-bottom: 0.5rem;">${step.value}</div>
                    <div style="font-weight: 600; font-size: 0.875rem; color: var(--color-text-main);">${step.label}</div>
                    ${step.percent !== '-' ? `<div class="text-muted text-xs">${step.percent}</div>` : ''}
                `;
        stepsContainer.appendChild(stepEl);

        if (index < funnelSteps.length - 1) {
          const arrow = document.createElement('div');
          arrow.innerHTML = `<i class="ph ph-arrow-right" style="font-size: 1.5rem; color: var(--color-border);"></i>`;
          stepsContainer.appendChild(arrow);
        }
      });
      funnel.appendChild(stepsContainer);
      innerContent.appendChild(funnel);

      // Leads Table
      const leadsCard = document.createElement('div');
      leadsCard.className = 'card';
      leadsCard.innerHTML = `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1.5rem;">Campaign Leads</h3>`;

      // State for filtering and searching
      let statusFilter = 'all'; // 'all', 'converted', 'pending'
      let searchQuery = '';

      // Filter and search function
      const getFilteredLeads = () => {
        let filtered = [...leads];

        // Apply status filter
        if (statusFilter === 'converted') {
          filtered = filtered.filter(l => l.status === 'CONVERTED');
        } else if (statusFilter === 'pending') {
          filtered = filtered.filter(l => l.status === 'PENDING');
        }

        // Apply search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(l =>
            (l.name && l.name.toLowerCase().includes(query)) ||
            (l.email && l.email.toLowerCase().includes(query)) ||
            (l.phone && l.phone.toLowerCase().includes(query))
          );
        }

        return filtered;
      };

      // Toolbar container
      const toolbar = document.createElement('div');
      toolbar.className = 'flex justify-between items-center gap-md';
      toolbar.style.marginBottom = '1.5rem';

      // Left side: Filter and Search
      const leftControls = document.createElement('div');
      leftControls.className = 'flex items-center gap-md';
      leftControls.style.flex = '1';

      // Status Filter Dropdown
      const filterContainer = document.createElement('div');
      filterContainer.style.position = 'relative';
      filterContainer.innerHTML = `
        <select id="status-filter" class="input" style="padding-right: 2.5rem; min-width: 160px;">
          <option value="all">All Leads</option>
          <option value="converted">Coupon Used</option>
          <option value="pending">Pending</option>
        </select>
      `;

      // Search Bar
      const searchContainer = document.createElement('div');
      searchContainer.style.position = 'relative';
      searchContainer.style.flex = '1';
      searchContainer.style.maxWidth = '400px';
      searchContainer.innerHTML = `
        <input 
          type="text" 
          id="lead-search" 
          class="input" 
          placeholder="Search by name, email, or phone..." 
          style="padding-left: 2.5rem;"
        />
        <i class="ph ph-magnifying-glass" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted);"></i>
      `;

      leftControls.appendChild(filterContainer);
      leftControls.appendChild(searchContainer);

      // Right side: Add Contact Button
      const addContactBtn = document.createElement('button');
      addContactBtn.className = 'btn btn-primary';
      addContactBtn.innerHTML = `<i class="ph ph-plus"></i> Add Contact`;
      addContactBtn.onclick = () => {
        openAddContactModal();
      };

      toolbar.appendChild(leftControls);
      toolbar.appendChild(addContactBtn);
      leadsCard.appendChild(toolbar);

      // Table container that will be updated
      const tableContainer = document.createElement('div');

      const renderTable = () => {
        const filteredLeads = getFilteredLeads();
        tableContainer.innerHTML = '';

        const leadsTable = Table({
          columns: [
            { header: 'Name', key: 'name', render: (l) => `<span style="font-weight: 600;">${l.name || 'Anonymous'}</span>` },
            { header: 'Phone Number', key: 'phone' },
            { header: 'Coupon Code', key: 'coupon', render: () => `<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">${coupon?.code || '-'}</code>` },
            {
              header: 'Status',
              key: 'status',
              render: (l) => {
                const isConverted = l.status === 'CONVERTED';
                const style = isConverted
                  ? 'background: #ecfdf5; color: #059669;'
                  : 'background: #fffbeb; color: #d97706;';
                return `<span style="padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; ${style}">${isConverted ? 'Coupon Used' : 'Pending'}</span>`;
              }
            },
            {
              header: 'Actions',
              key: 'id',
              render: (l) => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-sm btn-outline';
                btn.innerHTML = `<i class="ph ph-pencil"></i> Edit`;
                btn.onclick = (e) => {
                  e.stopPropagation();
                  openEditLeadModal(l, coupon?.code);
                };
                return btn;
              }
            }
          ],
          data: filteredLeads
        });

        tableContainer.appendChild(leadsTable);
      };

      // Initial render
      renderTable();

      // Event listeners for filter and search
      setTimeout(() => {
        const filterSelect = document.getElementById('status-filter');
        const searchInput = document.getElementById('lead-search');

        if (filterSelect) {
          filterSelect.addEventListener('change', (e) => {
            statusFilter = e.target.value;
            renderTable();
          });
        }

        if (searchInput) {
          searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderTable();
          });
        }
      }, 0);

      leadsCard.appendChild(tableContainer);
      innerContent.appendChild(leadsCard);

      // Add Contact Modal
      const openAddContactModal = () => {
        const content = document.createElement('div');
        content.className = 'flex flex-col gap-lg';
        content.innerHTML = `
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="new-lead-name" class="input" placeholder="e.g. Rahul Sharma">
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="new-lead-email" class="input" placeholder="e.g. rahul@example.com">
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" id="new-lead-phone" class="input" placeholder="e.g. +91 98200 12345">
          </div>
        `;

        const modal = Modal({
          title: 'Add New Contact',
          confirmText: 'Add Contact',
          content,
          onConfirm: () => {
            const name = content.querySelector('#new-lead-name').value.trim();
            const email = content.querySelector('#new-lead-email').value.trim();
            const phone = content.querySelector('#new-lead-phone').value.trim();

            if (!name && !email && !phone) {
              alert('Please fill in at least one field');
              return;
            }

            api.createLead({
              campaignId: parseInt(campaignId),
              name,
              email,
              phone,
              platformSource: details.platformSource
            }).then(() => {
              loadDetails();
            }).catch(err => {
              alert('Failed to add contact: ' + err.message);
            });
          }
        });
        document.body.appendChild(modal);
      };
    });
  };

  loadDetails();
  container.appendChild(innerContent);
  return container;
}
