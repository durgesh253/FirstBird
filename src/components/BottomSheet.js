/**
 * BottomSheet Component
 * Mobile-friendly modal that slides up from bottom
 * Auto-converts to regular modal on desktop
 */

export function BottomSheet({ title, content, onClose }) {
    const overlay = document.createElement('div');
    overlay.className = 'bottom-sheet-overlay';

    const isMobile = window.innerWidth < 768;

    overlay.innerHTML = `
        <div class="bottom-sheet ${isMobile ? 'mobile' : 'desktop'}">
            <div class="bottom-sheet-header">
                <div class="bottom-sheet-handle"></div>
                <h3>${title}</h3>
                <button class="bottom-sheet-close" aria-label="Close">
                    <i class="ph ph-x"></i>
                </button>
            </div>
            <div class="bottom-sheet-body" id="bottomSheetContent"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Add content
    const contentContainer = overlay.querySelector('#bottomSheetContent');
    if (typeof content === 'string') {
        contentContainer.innerHTML = content;
    } else {
        contentContainer.appendChild(content);
    }

    // Animation
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);

    // Close handlers
    const close = () => {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            if (onClose) onClose();
        }, 300);
    };

    overlay.querySelector('.bottom-sheet-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    // Swipe to dismiss on mobile
    if (isMobile) {
        let startY = 0;
        let currentY = 0;
        const sheet = overlay.querySelector('.bottom-sheet');

        sheet.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        sheet.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            if (diff > 0) {
                sheet.style.transform = `translateY(${diff}px)`;
            }
        });

        sheet.addEventListener('touchend', () => {
            const diff = currentY - startY;
            if (diff > 100) {
                close();
            } else {
                sheet.style.transform = '';
            }
        });
    }

    return overlay;
}
