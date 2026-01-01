export function KPICard({ title, value, trend, trendValue, icon, iconColor = 'primary' }) {
    const div = document.createElement('div');
    div.className = 'card';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.gap = '0.5rem';
    div.style.padding = '1.25rem';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'flex-start';

    const iconEl = document.createElement('div');
    iconEl.style.width = '40px';
    iconEl.style.height = '40px';
    iconEl.style.borderRadius = '8px';
    iconEl.style.backgroundColor = `var(--color-bg)`;
    iconEl.style.color = `var(--color-${iconColor})`;
    iconEl.style.display = 'flex';
    iconEl.style.alignItems = 'center';
    iconEl.style.justifyContent = 'center';
    iconEl.style.fontSize = '1.25rem';
    iconEl.innerHTML = `<i class="ph ${icon}"></i>`;

    const trendEl = document.createElement('span');
    trendEl.className = 'text-sm font-semibold';
    trendEl.style.color = trend === 'up' ? 'var(--color-secondary)' : 'var(--color-danger)';
    trendEl.style.display = 'flex';
    trendEl.style.alignItems = 'center';
    trendEl.style.gap = '0.25rem';
    trendEl.innerHTML = `<i class="ph ph-trend-${trend}"></i> ${trendValue}`;

    header.appendChild(iconEl);
    if (trendValue) header.appendChild(trendEl);

    const content = document.createElement('div');
    content.innerHTML = `
    <div class="text-muted text-sm" style="margin-bottom: 0.25rem;">${title}</div>
    <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-text-main);">${value}</div>
  `;

    div.appendChild(header);
    div.appendChild(content);

    return div;
}
