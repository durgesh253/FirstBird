import { Table } from '../components/Table';
import { Modal } from '../components/Modal';
import { api } from '../services/api';

export function Leads() {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-lg';

  // Header
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center';

  const titleDiv = document.createElement('div');
  titleDiv.innerHTML = `
    <h1 style="font-size: 1.875rem; font-weight: 700; color: var(--color-text-main);">Leads</h1>
    <p class="text-muted">Manage your uploaded leads and attribution.</p>
  `;

  const uploadBtn = document.createElement('button');
  uploadBtn.className = 'btn btn-primary';
  uploadBtn.innerHTML = `<i class="ph ph-upload-simple" style="margin-right: 0.5rem;"></i> Upload Leads File`;

  header.appendChild(titleDiv);
  header.appendChild(uploadBtn);
  container.appendChild(header);

  // Workflow Info Card
  const workflowCard = document.createElement('div');
  workflowCard.className = 'card';
  workflowCard.style.backgroundColor = '#f0f9ff';
  workflowCard.style.borderLeft = '4px solid #0284c7';
  workflowCard.innerHTML = `
    <div style="padding: 1.5rem;">
      <h3 style="font-weight: 600; margin-bottom: 1rem; color: var(--color-text-main);">Lead Conversion Workflow</h3>
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; font-size: 0.875rem;">
        <div style="flex: 1; min-width: 150px;">
          <div style="text-align: center;">
            <div style="width: 32px; height: 32px; background: #0284c7; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin: 0 auto 0.5rem;">1</div>
            <span style="font-weight: 500;">Upload Leads</span>
            <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">CSV file to campaign</p>
          </div>
        </div>
        <div style="color: var(--color-text-muted);">→</div>
        <div style="flex: 1; min-width: 150px;">
          <div style="text-align: center;">
            <div style="width: 32px; height: 32px; background: #0284c7; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin: 0 auto 0.5rem;">2</div>
            <span style="font-weight: 500;">Match Orders</span>
            <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">Customer data</p>
          </div>
        </div>
        <div style="color: var(--color-text-muted);">→</div>
        <div style="flex: 1; min-width: 150px;">
          <div style="text-align: center;">
            <div style="width: 32px; height: 32px; background: #0284c7; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin: 0 auto 0.5rem;">3</div>
            <span style="font-weight: 500;">Use Coupon</span>
            <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">From campaign</p>
          </div>
        </div>
        <div style="color: var(--color-text-muted);">→</div>
        <div style="flex: 1; min-width: 150px;">
          <div style="text-align: center;">
            <div style="width: 32px; height: 32px; background: #16a34a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin: 0 auto 0.5rem;">✓</div>
            <span style="font-weight: 500;">Converted</span>
            <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem;">Lead is converted</p>
          </div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(workflowCard);

  const innerContent = document.createElement('div');
  innerContent.className = 'flex flex-col gap-lg';
  innerContent.innerHTML = '<div class="card p-lg text-center text-muted">Loading leads...</div>';
  container.appendChild(innerContent);

  // Upload Modal Logic
  uploadBtn.onclick = async () => {
    const campaigns = await api.getCampaigns();

    const content = document.createElement('div');
    content.className = 'flex flex-col gap-md';
    content.innerHTML = `
            <div id="dropZone" style="border: 2px dashed var(--color-border); padding: 2.5rem; border-radius: 0.75rem; text-align: center; color: var(--color-text-muted); cursor: pointer; transition: all 0.2s;">
                <i class="ph ph-file-csv" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: var(--color-primary);"></i>
                <p class="font-medium">Drag & drop CSV file here or click to browse</p>
                <p class="text-[10px] mt-md">Supports Name, Email, Phone columns</p>
                <input type="file" id="csvFile" accept=".csv" style="display: none;">
            </div>
            <div class="flex flex-col gap-sm">
                <label class="text-sm font-semibold">Campaign</label>
                <select id="targetCampaign" style="width: 100%; padding: 0.625rem; border: 1px solid var(--color-border); border-radius: 0.5rem;">
                    ${campaigns.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    ${campaigns.length === 0 ? '<option disabled>No campaigns found - create one first</option>' : ''}
                </select>
            </div>
        `;

    const dropZone = content.querySelector('#dropZone');
    const fileInput = content.querySelector('#csvFile');
    dropZone.onclick = () => fileInput.click();

    let parsedLeads = [];
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split(/\r?\n/).filter(r => r.trim());
        if (rows.length < 2) return alert('CSV file is empty or missing data');

        // Robust CSV splitting (handles quotes)
        const splitCSV = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else current += char;
          }
          result.push(current.trim());
          return result;
        };

        const headers = splitCSV(rows[0]).map(h => h.toLowerCase());

        // Define header variants
        const nameKeywords = ['name', 'full name', 'first name', 'last name', 'customer', 'contact'];
        const emailKeywords = ['email', 'e-mail', 'mail'];
        const phoneKeywords = ['phone', 'mobile', 'cell', 'tel', 'contact number'];

        const findIndex = (keywords) => headers.findIndex(h => keywords.some(k => h.includes(k)));

        const nameIdx = findIndex(nameKeywords);
        const emailIdx = findIndex(emailKeywords);
        const phoneIdx = findIndex(phoneKeywords);

        parsedLeads = rows.slice(1).map(row => {
          const values = splitCSV(row);
          const email = emailIdx !== -1 ? values[emailIdx] : null;
          const phone = phoneIdx !== -1 ? values[phoneIdx] : null;

          return {
            name: nameIdx !== -1 ? values[nameIdx] : 'Anonymous',
            email: email && email.trim() !== '' ? email.trim() : null,
            phone: phone && phone.trim() !== '' ? phone.trim() : null
          };
        }).filter(l => l.email || l.phone);

        dropZone.innerHTML = `
                    <i class="ph ph-check-circle" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: #22C55E;"></i>
                    <p class="font-semibold text-green-600">${file.name} ready</p>
                    <p class="text-xs text-muted">${parsedLeads.length} leads found</p>
                    <div style="margin-top: 1rem; padding: 0.5rem; background: #f8fafc; border-radius: 4px; font-size: 10px; text-align: left;">
                      <strong>Found Headers:</strong> ${headers.join(', ')}<br>
                      <strong>Mapped:</strong> 
                      Name: ${nameIdx !== -1 ? '✅' : '❌'}, 
                      Email: ${emailIdx !== -1 ? '✅' : '❌'}, 
                      Phone: ${phoneIdx !== -1 ? '✅' : '❌'}
                    </div>
                `;
        dropZone.style.borderColor = '#22C55E';
        dropZone.style.background = '#F0FDF4';
      };
      reader.readAsText(file);
    };

    const modal = Modal({
      title: 'Upload Leads',
      content,
      onConfirm: async () => {
        const campaignId = content.querySelector('#targetCampaign').value;
        if (!campaignId) return alert('Please select a campaign');
        if (parsedLeads.length === 0) return alert('No valid leads found in file');

        const campaign = campaigns.find(c => c.id == campaignId);
        const results = await api.uploadLeads(campaignId, parsedLeads.map(l => ({
          ...l,
          platformSource: campaign.platformSource
        })));

        if (results?.success) {
          alert(`${results.count} leads assigned to ${campaign.name}`);
          loadLeads();
        }
      }
    });
    document.body.appendChild(modal);
  };

  const loadLeads = () => {
    innerContent.innerHTML = '<div class="card p-lg text-center text-muted">Loading leads...</div>';

    api.getLeads().then(leads => {
      innerContent.innerHTML = '';

      if (!leads || leads.length === 0) {
        innerContent.innerHTML = '<div class="card p-lg text-center text-muted">No leads found. Upload a CSV file to get started!</div>';
        return;
      }

      const columns = [
        { header: 'Name', key: 'name', render: row => `<span style="font-weight: 500;">${row.name || '-'}</span>` },
        { header: 'Email', key: 'email', render: row => row.email || '-' },
        { header: 'Phone', key: 'phone', render: row => row.phone || '-' },
        { header: 'Campaign', key: 'campaign', render: row => `<span class="badge" style="background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">${row.campaign?.name || 'Unknown'}</span>` },
        {
          header: 'Status', key: 'status', render: row => {
            const status = row.status || 'PENDING';
            let style = 'padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;';
            if (status === 'CONVERTED') style += ' background: #ecfdf5; color: #059669;';
            else if (status === 'LOST') style += ' background: #fef2f2; color: #dc2626;';
            else style += ' background: #fefce8; color: #854d0e;';
            return `<span style="${style}">${status}</span>`;
          }
        },
        { header: 'Uploaded At', key: 'uploadedAt', render: row => new Date(row.uploadedAt).toLocaleDateString() }
      ];

      const table = Table({
        columns,
        data: leads,
        onRowClick: (item) => {
          // Optional: Navigate to campaign?
          if (item.campaignId) {
            history.pushState({}, '', `/campaigns/detail?id=${item.campaignId}`);
            window.dispatchEvent(new Event('popstate'));
          }
        }
      });
      innerContent.appendChild(table);
    });
  };

  loadLeads();
  return container;
}
