export function MobileNav() {
    const nav = document.createElement('nav');
    nav.className = 'mobile-nav';
    nav.style.position = 'fixed';
    nav.style.bottom = '0';
    nav.style.left = '0';
    nav.style.width = '100%';
    nav.style.backgroundColor = 'white';
    nav.style.borderTop = '1px solid var(--color-border)';
    nav.style.display = 'flex';
    nav.style.justifyContent = 'space-around';
    nav.style.padding = '0.5rem 0';
    nav.style.zIndex = '100';

    const items = [
        { label: 'Home', icon: 'ph-house', href: '/' },
        { label: 'Orders', icon: 'ph-shopping-cart', href: '/orders' },
        { label: 'Coupons', icon: 'ph-ticket', href: '/coupons' },
        { label: 'Promo', icon: 'ph-megaphone', href: '/campaigns' },
        { label: 'More', icon: 'ph-dots-three-circle', href: '/settings' }, // Simplified for demo
    ];

    items.forEach(item => {
        const a = document.createElement('a');
        a.href = item.href;
        a.style.display = 'flex';
        a.style.flexDirection = 'column';
        a.style.alignItems = 'center';
        a.style.gap = '0.25rem';
        a.style.color = window.location.pathname === item.href ? 'var(--color-primary)' : 'var(--color-text-muted)';
        a.style.textDecoration = 'none';
        a.style.fontSize = '0.75rem';
        a.style.width = '100%';

        a.innerHTML = `
      <i class="ph ${item.icon}" style="font-size: 1.5rem;"></i>
      <span>${item.label}</span>
    `;

        nav.appendChild(a);
    });

    return nav;
}
