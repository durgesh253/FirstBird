/**
 * CallStatusDropdown Component
 * Inline dropdown for updating customer call status
 */

const API_BASE = (location.hostname === 'localhost') ? 'http://localhost:3000' : 'https://firstbird.onrender.com';

export function CallStatusDropdown({ phone, currentStatus, onUpdate }) {
    const container = document.createElement('div');
    container.className = 'call-status-dropdown';

    const statusOptions = [
        { value: 'NOT_CALLED', label: 'Not Called', color: '#6b7280' },
        { value: 'CALLED_INTERESTED', label: 'Called - Interested', color: '#10b981' },
        { value: 'CALLED_NOT_INTERESTED', label: 'Called - Not Interested', color: '#ef4444' },
        { value: 'FOLLOW_UP_REQUIRED', label: 'Follow-up Required', color: '#f59e0b' },
        { value: 'CONVERTED', label: 'Converted', color: '#3b82f6' }
    ];

    const current = statusOptions.find(s => s.value === currentStatus) || statusOptions[0];

    container.innerHTML = `
        <div class="call-status-badge" style="background: ${current.color}20; color: ${current.color}; border: 1px solid ${current.color}40;">
            <span class="status-label">${current.label}</span>
            <i class="ph ph-caret-down"></i>
        </div>
        <div class="call-status-menu" style="display: none;">
            ${statusOptions.map(option => `
                <div class="call-status-option ${option.value === currentStatus ? 'active' : ''}" data-value="${option.value}">
                    <div class="status-indicator" style="background: ${option.color};"></div>
                    <span>${option.label}</span>
                    ${option.value === currentStatus ? '<i class="ph ph-check"></i>' : ''}
                </div>
            `).join('')}
        </div>
    `;

    const badge = container.querySelector('.call-status-badge');
    const menu = container.querySelector('.call-status-menu');

    // Toggle menu
    badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.style.display === 'block';
        menu.style.display = isOpen ? 'none' : 'block';
    });

    // Close menu when clicking outside
    document.addEventListener('click', () => {
        menu.style.display = 'none';
    });

    // Handle status selection
    container.querySelectorAll('.call-status-option').forEach(option => {
        option.addEventListener('click', async (e) => {
            e.stopPropagation();
            const newStatus = option.getAttribute('data-value');

            if (newStatus === currentStatus) {
                menu.style.display = 'none';
                return;
            }

            // Show loading
            badge.style.opacity = '0.5';
            badge.style.pointerEvents = 'none';

            try {
                const response = await fetch(`${API_BASE}/api/customers/${phone}/call-status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ callStatus: newStatus })
                });

                if (!response.ok) {
                    throw new Error('Failed to update call status');
                }

                const updated = await response.json();

                // Update UI
                const newOption = statusOptions.find(s => s.value === newStatus);
                badge.style.background = `${newOption.color}20`;
                badge.style.color = newOption.color;
                badge.style.borderColor = `${newOption.color}40`;
                badge.querySelector('.status-label').textContent = newOption.label;

                // Update active state
                container.querySelectorAll('.call-status-option').forEach(opt => {
                    opt.classList.remove('active');
                    opt.querySelector('i')?.remove();
                });
                option.classList.add('active');
                option.innerHTML += '<i class="ph ph-check"></i>';

                menu.style.display = 'none';

                if (onUpdate) {
                    onUpdate(updated);
                }
            } catch (error) {
                console.error('Error updating call status:', error);
                alert('Failed to update call status. Please try again.');
            } finally {
                badge.style.opacity = '1';
                badge.style.pointerEvents = 'auto';
            }
        });
    });

    return container;
}
