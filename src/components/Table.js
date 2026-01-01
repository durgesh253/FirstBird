export function Table({ columns, data, onRowClick }) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.fontSize = '0.875rem';

    // Header
    const thead = document.createElement('thead');
    thead.style.backgroundColor = 'var(--color-bg)';
    thead.style.borderBottom = '1px solid var(--color-border)';

    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.style.textAlign = 'left';
        th.style.padding = '0.75rem 1rem';
        th.style.fontWeight = '600';
        th.style.color = 'var(--color-text-muted)';
        th.innerText = col.header;
        th.style.display = col.hideOnMobile ? 'none' : 'table-cell';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid var(--color-border)';
        tr.style.transition = 'background-color 0.2s';
        tr.style.cursor = onRowClick ? 'pointer' : 'default';
        tr.style.display = 'table-row';

        tr.addEventListener('mouseenter', () => tr.style.backgroundColor = '#f9fafb');
        tr.addEventListener('mouseleave', () => tr.style.backgroundColor = 'transparent');

        if (onRowClick) {
            tr.addEventListener('click', (e) => onRowClick(item, e));
        }

        columns.forEach((col, idx) => {
            const td = document.createElement('td');
            td.style.padding = '1rem';
            td.style.color = 'var(--color-text-main)';
            td.style.display = col.hideOnMobile ? 'none' : 'table-cell';
            
            // Set data-label for all columns (used in mobile card view)
            td.setAttribute('data-label', col.header);

            const content = col.render ? col.render(item) : item[col.key];
            if (content instanceof HTMLElement) {
                td.appendChild(content);
            } else {
                td.innerHTML = content;
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    const container = document.createElement('div');
    container.className = 'card';
    container.style.padding = '0';
    container.style.overflowX = 'auto';
    container.appendChild(table);

    return container;
}
