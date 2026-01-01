export function Sidebar() {
  const navItems = [
    { label: 'Dashboard', icon: 'ph-house', href: '/' },
    { label: 'Orders', icon: 'ph-shopping-cart', href: '/orders' },
    { label: 'Coupons', icon: 'ph-ticket', href: '/coupons' },
    { label: 'Leads', icon: 'ph-users', href: '/leads' },
    { label: 'Campaigns', icon: 'ph-megaphone', href: '/campaigns' },
    { label: 'Analytics', icon: 'ph-chart-bar', href: '/analytics' },
  ];

  const bottomItems = [
    { label: 'Repeat Customers', icon: 'ph-repeat', href: '/repeat-customers' },
    { label: 'Subscriptions', icon: 'ph-credit-card', href: '/subscriptions' },
    { label: 'Customers', icon: 'ph-user-list', href: '/customers' },
    { label: 'Settings', icon: 'ph-gear', href: '/settings' },
  ];

  const element = document.createElement('aside');
  element.className = 'sidebar';
  element.style.width = '260px';
  element.style.height = '100vh';
  element.style.backgroundColor = 'white';
  element.style.borderRight = '1px solid var(--color-border)';
  element.style.display = 'flex';
  element.style.flexDirection = 'column';
  element.style.padding = 'var(--spacing-lg)';

  const logo = document.createElement('div');
  logo.className = 'logo';
  logo.innerHTML = `<h2 style="font-size: 1.25rem; font-weight: 700; color: var(--color-primary); margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem;"><i class="ph ph-chart-polar"></i> Analytics</h2>`;
  element.appendChild(logo);

  const nav = document.createElement('nav');
  nav.style.flex = '1';
  nav.style.display = 'flex';
  nav.style.flexDirection = 'column';
  nav.style.gap = '0.5rem';

  const createLink = (item) => {
    const a = document.createElement('a');
    a.href = item.href;
    a.className = 'nav-item';
    a.style.display = 'flex';
    a.style.alignItems = 'center';
    a.style.gap = '0.75rem';
    a.style.padding = '0.75rem 1rem';
    a.style.borderRadius = 'var(--radius-md)';
    a.style.color = 'var(--color-text-muted)';
    a.style.fontWeight = '500';
    a.style.transition = 'all 0.2s';

    // Quick active state check (basic)
    if (window.location.pathname === item.href) {
      a.style.backgroundColor = '#eef2ff'; // Light indigo
      a.style.color = 'var(--color-primary)';
    }

    a.innerHTML = `<i class="ph ${item.icon}" style="font-size: 1.25rem;"></i> ${item.label}`;

    a.addEventListener('mouseenter', () => {
      if (window.location.pathname !== item.href) {
        a.style.color = 'var(--color-text-main)';
        a.style.backgroundColor = 'var(--color-bg)';
      }
    });

    a.addEventListener('mouseleave', () => {
      if (window.location.pathname !== item.href) {
        a.style.color = 'var(--color-text-muted)';
        a.style.backgroundColor = 'transparent';
      }
    });

    return a;
  }

  navItems.forEach(item => nav.appendChild(createLink(item)));

  // Separator
  const separator = document.createElement('div');
  separator.style.height = '1px';
  separator.style.backgroundColor = 'var(--color-border)';
  separator.style.margin = '1rem 0';
  nav.appendChild(separator);

  bottomItems.forEach(item => nav.appendChild(createLink(item)));

  element.appendChild(nav);

  return element;
}
