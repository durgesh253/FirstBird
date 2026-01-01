export function TopPerformers(data) {
  const container = document.createElement('div');
  container.className = 'card';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '1rem';

  container.innerHTML = `<h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Top Performers</h3>`;

  const items = [
    { label: 'Best Campaign', value: data?.bestCampaign?.name || 'None', sub: `₹${Number(data?.bestCampaign?.revenue || 0).toLocaleString()}`, icon: 'ph-megaphone', color: 'primary' },
    { label: 'Best Coupon', value: data?.bestCoupon?.code || 'None', sub: `₹${Number(data?.bestCoupon?.revenue || 0).toLocaleString()}`, icon: 'ph-ticket', color: 'secondary' },
    { label: 'Best Platform', value: data?.bestPlatform?.name || 'None', sub: `${data?.bestPlatform?.count || 0} Orders`, icon: 'ph-globe', color: 'warning' }
  ];

  const list = document.createElement('div');
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '1rem';

  items.forEach(item => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '1rem';
    row.style.padding = '0.75rem';
    row.style.borderRadius = 'var(--radius-md)';
    row.style.backgroundColor = 'var(--color-bg)';

    row.innerHTML = `
      <div style="width: 36px; height: 36px; border-radius: 50%; background-color: white; display: flex; align-items: center; justify-content: center; color: var(--color-${item.color}); box-shadow: var(--shadow-sm);">
        <i class="ph ${item.icon}" style="font-size: 1.25rem;"></i>
      </div>
      <div style="flex: 1;">
        <div style="font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">${item.label}</div>
        <div style="font-weight: 600;">${item.value}</div>
      </div>
      <div style="font-weight: 700; color: var(--color-text-main);">${item.sub}</div>
    `;
    list.appendChild(row);
  });

  container.appendChild(list);
  return container;
}
