export function Drawer({ title, content, onClose }) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'flex-end';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';

    const drawer = document.createElement('div');
    drawer.style.width = '400px';
    drawer.style.maxWidth = '90%';
    drawer.style.height = '100%';
    drawer.style.backgroundColor = 'white';
    drawer.style.boxShadow = 'var(--shadow-lg)';
    drawer.style.transform = 'translateX(100%)';
    drawer.style.transition = 'transform 0.3s ease';
    drawer.style.display = 'flex';
    drawer.style.flexDirection = 'column';

    // Animation helper
    setTimeout(() => {
        overlay.style.opacity = '1';
        drawer.style.transform = 'translateX(0)';
    }, 10);

    const close = () => {
        overlay.style.opacity = '0';
        drawer.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(overlay);
            if (onClose) onClose();
        }, 300);
    };

    const header = document.createElement('div');
    header.style.padding = 'var(--spacing-lg)';
    header.style.borderBottom = '1px solid var(--color-border)';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.innerHTML = `
    <h3 style="font-size: 1.25rem; font-weight: 600;">${title}</h3>
    <button class="btn-close" style="background: none; border: none; font-size: 1.5rem; color: var(--color-text-muted); cursor: pointer;"><i class="ph ph-x"></i></button>
  `;
    header.querySelector('.btn-close').onclick = close;
    drawer.appendChild(header);

    const body = document.createElement('div');
    body.style.flex = '1';
    body.style.overflowY = 'auto';
    body.style.padding = 'var(--spacing-lg)';

    if (typeof content === 'string') {
        body.innerHTML = content;
    } else {
        body.appendChild(content);
    }
    drawer.appendChild(body);

    overlay.appendChild(drawer);
    overlay.onclick = (e) => {
        if (e.target === overlay) close();
    };

    return overlay;
}
