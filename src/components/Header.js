export function Header() {
    const element = document.createElement('header');
    element.className = 'top-header';
    element.style.height = '64px';
    element.style.backgroundColor = 'white';
    element.style.borderBottom = '1px solid var(--color-border)';
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'space-between';
    element.style.padding = '0 var(--spacing-xl)';

    const leftSection = document.createElement('div');
    leftSection.style.display = 'flex';
    leftSection.style.alignItems = 'center';
    leftSection.style.gap = '1rem';
    leftSection.innerHTML = `
    <div style="font-weight: 600;">My Shopify Store</div>
    <span style="color: var(--color-border);">|</span>
    <button class="btn" style="border: 1px solid var(--color-border); padding: 0.25rem 0.75rem; font-size: 0.875rem; color: var(--color-text-muted);">
      <i class="ph ph-calendar-blank" style="margin-right: 0.5rem;"></i> This Month
    </button>
  `;

    const rightSection = document.createElement('div');
    rightSection.style.display = 'flex';
    rightSection.style.alignItems = 'center';
    rightSection.style.gap = '1rem';

    // Search
    const searchWrapper = document.createElement('div');
    searchWrapper.style.position = 'relative';
    searchWrapper.innerHTML = `
    <i class="ph ph-magnifying-glass" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-text-muted);"></i>
    <input type="text" placeholder="Search..." style="padding: 0.5rem 0.5rem 0.5rem 2.25rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: inherit; font-size: 0.875rem; width: 240px;">
  `;

    // Profile
    const profile = document.createElement('div');
    profile.style.width = '32px';
    profile.style.height = '32px';
    profile.style.borderRadius = '50%';
    profile.style.backgroundColor = 'var(--color-primary)';
    profile.style.color = 'white';
    profile.style.display = 'flex';
    profile.style.alignItems = 'center';
    profile.style.justifyContent = 'center';
    profile.style.fontWeight = '600';
    profile.style.fontSize = '0.875rem';
    profile.innerText = 'JS';

    rightSection.appendChild(searchWrapper);
    rightSection.appendChild(profile);

    element.appendChild(leftSection);
    element.appendChild(rightSection);

    return element;
}
