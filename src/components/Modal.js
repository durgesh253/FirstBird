export function Modal({ title, confirmText = 'Confirm', content, onConfirm, onCancel }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center; z-index: 1000;
    `;

    const modal = document.createElement('div');
    modal.className = 'modal-container card';
    modal.style.cssText = `
        width: 500px; max-width: 90%; display: flex; flex-direction: column; gap: 1.5rem;
        border: none; box-shadow: var(--shadow-lg); transition: all 0.2s;
    `;

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.innerHTML = `
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--color-text-main);">${title}</h3>
        <button class="btn-icon close-btn" style="background: transparent; border: none; font-size: 1.5rem; color: var(--color-text-muted); cursor: pointer;">&times;</button>
    `;
    modal.appendChild(header);

    const body = document.createElement('div');
    body.style.color = 'var(--color-text-main)';
    if (typeof content === 'string') {
        body.innerHTML = content;
    } else {
        body.appendChild(content);
    }
    modal.appendChild(body);

    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'flex-end';
    footer.style.gap = '0.75rem';
    footer.style.marginTop = '0.5rem';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.innerText = 'Cancel';
    cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
        if (onCancel) onCancel();
    };

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn btn-primary';
    confirmBtn.innerText = confirmText;
    confirmBtn.onclick = () => {
        if (onConfirm) onConfirm();
        document.body.removeChild(overlay);
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);
    modal.appendChild(footer);

    overlay.appendChild(modal);

    const closeHandler = () => {
        document.body.removeChild(overlay);
        if (onCancel) onCancel();
    };

    header.querySelector('.close-btn').onclick = closeHandler;

    overlay.onclick = (e) => {
        if (e.target === overlay) closeHandler();
    };

    return overlay;
}
