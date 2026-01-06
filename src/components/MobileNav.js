import { Drawer } from './Drawer';

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
        { label: 'More', icon: 'ph-dots-three-circle', action: 'openDrawer' },
    ];

    const moreItems = [
        { label: 'Leads', icon: 'ph-users', href: '/leads' },
        { label: 'Analytics', icon: 'ph-chart-bar', href: '/analytics' },
        { label: 'Repeat Customers', icon: 'ph-repeat', href: '/repeat-customers' },
        { label: 'Subscriptions', icon: 'ph-credit-card', href: '/subscriptions' },
        { label: 'Customers', icon: 'ph-user-list', href: '/customers' },
        { label: 'Settings', icon: 'ph-gear', href: '/settings' },
    ];

    items.forEach(item => {
        const btn = document.createElement(item.href ? 'a' : 'button');
        if (item.href) btn.href = item.href;

        btn.style.display = 'flex';
        btn.style.flexDirection = 'column';
        btn.style.alignItems = 'center';
        btn.style.gap = '0.25rem';
        btn.style.color = window.location.pathname === item.href ? 'var(--color-primary)' : 'var(--color-text-muted)';
        btn.style.textDecoration = 'none';
        btn.style.fontSize = '0.75rem';
        btn.style.width = '100%';
        btn.style.background = 'none';
        btn.style.border = 'none';
        btn.style.padding = '4px 0';
        btn.style.cursor = 'pointer';

        btn.innerHTML = `
      <i class="ph ${item.icon}" style="font-size: 1.5rem;"></i>
      <span>${item.label}</span>
    `;

        if (item.action === 'openDrawer') {
            btn.onclick = (e) => {
                e.preventDefault();
                openMoreDrawer();
            };
        }

        nav.appendChild(btn);
    });

    function openMoreDrawer() {
        const drawerContent = document.createElement('div');
        drawerContent.className = 'mobile-more-menu';
        drawerContent.style.display = 'flex';
        drawerContent.style.flexDirection = 'column';
        drawerContent.style.gap = '0.5rem';

        moreItems.forEach(item => {
            const a = document.createElement('a');
            a.href = item.href;
            a.className = 'nav-item';
            a.style.display = 'flex';
            a.style.alignItems = 'center';
            a.style.gap = '0.75rem';
            a.style.padding = '0.75rem 1rem';
            a.style.borderRadius = 'var(--radius-md)';
            a.style.color = window.location.pathname === item.href ? 'var(--color-primary)' : 'var(--color-text-muted)';
            a.style.fontWeight = '500';
            a.style.transition = 'all 0.2s';

            if (window.location.pathname === item.href) {
                a.style.backgroundColor = '#eef2ff';
            }

            a.innerHTML = `<i class="ph ${item.icon}" style="font-size: 1.25rem;"></i> ${item.label}`;

            a.onclick = () => {
                // The native navigation will handle the URL change, 
                // but we might want to close the drawer. 
                // The Drawer component handles overlay clicks, but we need to trigger its close logic.
                // For simplicity here, the page will reload/re-render and the drawer will be gone since it's not persisted.
            };

            drawerContent.appendChild(a);
        });

        const drawer = Drawer({
            title: 'Menu',
            content: drawerContent
        });
        document.body.appendChild(drawer);
    }

    return nav;
}
