import { api } from '../services/api';

export function RepeatCustomers() {
    const container = document.createElement('div');
    container.className = 'repeat-customers-page';

    const API_BASE = (location.hostname === 'localhost') ? 'http://localhost:3000' : '';

    // Styles
    const styles = document.createElement('style');
    styles.textContent = `
        .repeat-customers-page {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            padding: 0;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            color: white;
            box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        }

        .page-header h1 {
            margin: 0;
            font-size: 1.75rem;
            font-weight: 700;
        }

        .page-header p {
            margin: 0.25rem 0 0;
            opacity: 0.9;
            font-size: 0.9rem;
        }

        .btn-upload {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }

        .btn-upload:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        .tabs-container {
            display: flex;
            gap: 0.5rem;
            background: #f1f5f9;
            padding: 0.5rem;
            border-radius: 12px;
            width: fit-content;
        }

        .tab-btn {
            padding: 0.75rem 1.5rem;
            border: none;
            background: transparent;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            color: #64748b;
            transition: all 0.3s ease;
        }

        .tab-btn.active {
            background: white;
            color: #667eea;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tab-btn:hover:not(.active) {
            color: #334155;
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.98);
            border-radius: 16px;
            border: 1px solid rgba(0, 0, 0, 0.05);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }

        .card-header {
            padding: 1.25rem 1.5rem;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .card-header h3 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e293b;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            padding: 1.5rem;
        }

        .stat-card {
            background: white;
            border-radius: 16px;
            padding: 1.25rem;
            border: 1px solid #e2e8f0;
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .stat-icon.blue { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
        .stat-icon.green { background: linear-gradient(135deg, #10b981, #059669); color: white; }
        .stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
        .stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
        .stat-icon.pink { background: linear-gradient(135deg, #ec4899, #db2777); color: white; }

        .stat-label {
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1e293b;
            margin-top: 0.25rem;
        }

        .filters-section {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .filters-row {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            align-items: flex-end;
        }

        .filter-group {
            flex: 1;
            min-width: 180px;
        }

        .filter-group label {
            display: block;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 0.5rem;
        }

        .filter-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 0.9rem;
            background: #f8fafc;
            transition: all 0.3s ease;
        }

        .filter-input:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .filter-buttons {
            display: flex;
            gap: 0.75rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: white;
            color: #475569;
            border: 2px solid #e2e8f0;
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-secondary:hover {
            border-color: #667eea;
            color: #667eea;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table thead {
            background: #f8fafc;
        }

        .data-table th {
            padding: 1rem;
            text-align: left;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            color: #64748b;
            border-bottom: 2px solid #e2e8f0;
        }

        .data-table td {
            padding: 1rem;
            border-bottom: 1px solid #f1f5f9;
            font-size: 0.9rem;
            color: #334155;
        }

        .data-table tbody tr {
            transition: background 0.2s ease;
        }

        .data-table tbody tr:hover {
            background: #f8fafc;
        }

        .data-table tbody tr.repeat-customer {
            background: linear-gradient(90deg, rgba(236, 72, 153, 0.05), transparent);
        }

        .customer-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }

        .customer-name {
            font-weight: 600;
            color: #1e293b;
        }

        .customer-phone {
            font-size: 0.85rem;
            color: #64748b;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.35rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .badge-repeat {
            background: linear-gradient(135deg, #ec4899, #db2777);
            color: white;
        }

        .badge-new {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }

        .badge-returning {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
        }

        .badge-first-time {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
        }

        .btn-details {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-details:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
        }

        .modal-content {
            background: white;
            border-radius: 20px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
            animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
            padding: 1.5rem 2rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
        }

        .modal-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            font-size: 1.25rem;
            cursor: pointer;
        }

        .modal-body {
            padding: 2rem;
        }

        .customer-details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .detail-item {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 12px;
        }

        .detail-label {
            font-size: 0.75rem;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
        }

        .detail-value {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e293b;
            margin-top: 0.25rem;
        }

        .products-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .product-tag {
            background: #e0e7ff;
            color: #4338ca;
            padding: 0.35rem 0.75rem;
            border-radius: 6px;
            font-size: 0.85rem;
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #64748b;
        }

        .empty-state i {
            font-size: 4rem;
            opacity: 0.3;
            margin-bottom: 1rem;
        }

        .loading {
            text-align: center;
            padding: 3rem;
            color: #64748b;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .greeting-banner {
            background: linear-gradient(135deg, #ec4899, #db2777);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
            animation: fadeIn 0.3s ease;
        }

        .greeting-banner i {
            font-size: 1.5rem;
        }

        .upload-filter-banner {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            animation: fadeIn 0.3s ease;
        }

        .upload-filter-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 600;
        }

        .upload-filter-info i {
            font-size: 1.5rem;
        }

        .btn-clear-filter {
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-clear-filter:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .btn-delete {
            background: #ef4444;
            color: white;
            border: none;
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
        }

        .btn-delete:hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
        }

        .upload-row {
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .upload-row:hover {
            background: #f8fafc !important;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    container.appendChild(styles);

    // State
    let currentTab = 'customers';
    let activeUploadFilter = null; // Track if viewing specific upload
    let filters = {
        repeatOnly: false,
        searchPhone: '',
        searchName: '',
        searchCity: '',
        sortBy: 'totalOrders'
    };

    // Header
    container.innerHTML += `
        <div class="page-header">
            <div>
                <h1><i class="ph ph-users-three"></i> Repeat Customer Detection</h1>
                <p>Track and analyze customer purchase behavior across all orders</p>
            </div>
            <button id="uploadCSVBtn" class="btn-upload">
                <i class="ph ph-upload-simple"></i>
                Upload Orders CSV
            </button>
        </div>
    `;

    // Tabs
    const tabsHTML = `
        <div class="tabs-container">
            <button class="tab-btn active" data-tab="customers">
                <i class="ph ph-users"></i> Customer Table
            </button>
            <button class="tab-btn" data-tab="uploads">
                <i class="ph ph-clock-counter-clockwise"></i> Upload History
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', tabsHTML);

    // Content containers
    const customersSection = document.createElement('div');
    customersSection.id = 'customersSection';
    container.appendChild(customersSection);

    const uploadsSection = document.createElement('div');
    uploadsSection.id = 'uploadsSection';
    uploadsSection.style.display = 'none';
    container.appendChild(uploadsSection);

    // Tab switching
    setTimeout(() => {
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTab = btn.getAttribute('data-tab');

                if (currentTab === 'customers') {
                    customersSection.style.display = 'block';
                    uploadsSection.style.display = 'none';
                    loadCustomerTable();
                } else {
                    customersSection.style.display = 'none';
                    uploadsSection.style.display = 'block';
                    loadUploadHistory();
                }
            });
        });
    }, 100);

    // Load global customer stats
    async function loadStats() {
        try {
            const resp = await fetch(`${API_BASE}/api/customers/global-stats`);
            const stats = await resp.json();
            return stats;
        } catch (err) {
            console.error('Error loading stats:', err);
            return { totalCustomers: 0, newCustomers: 0, repeatCustomers: 0, totalOrders: 0, totalRevenue: 0 };
        }
    }

    // Load customer table with filters
    async function loadCustomerTable() {
        customersSection.innerHTML = '<div class="loading"><i class="ph ph-spinner" style="animation: spin 1s linear infinite;"></i> Loading customers...</div>';

        try {
            const stats = await loadStats();
            let customers;

            // Check if we're viewing a specific upload
            if (activeUploadFilter) {
                // Load customers from specific upload
                const queryParams = new URLSearchParams({
                    customerType: filters.repeatOnly ? 'Repeat' : '',
                    searchPhone: filters.searchPhone,
                    sortBy: filters.sortBy === 'totalOrders' ? 'total_orders' : filters.sortBy,
                    sortOrder: 'desc'
                });

                const resp = await fetch(`${API_BASE}/api/customers/analysis/${activeUploadFilter.id}?${queryParams}`);
                const data = await resp.json();
                customers = data.customers.map(c => ({
                    name: c.customerName,
                    phone: c.customerPhone,
                    city: c.location || '—',
                    totalOrders: c.globalTotalOrders || c.totalOrders,
                    isRepeatCustomer: c.isRepeatCustomer,
                    lastProductOrdered: c.productsBought?.[c.productsBought.length - 1] || '—',
                    lastOrderDate: c.lastOrderDate,
                    totalSpent: c.globalTotalSpent || c.totalSpent
                }));

                // Apply name and city filters client-side
                if (filters.searchName) {
                    customers = customers.filter(c => c.name?.toLowerCase().includes(filters.searchName.toLowerCase()));
                }
                if (filters.searchCity) {
                    customers = customers.filter(c => c.city?.toLowerCase().includes(filters.searchCity.toLowerCase()));
                }
            } else {
                // Load from global customer table
                const queryParams = new URLSearchParams({
                    repeatOnly: filters.repeatOnly.toString(),
                    searchPhone: filters.searchPhone,
                    searchName: filters.searchName,
                    searchCity: filters.searchCity,
                    sortBy: filters.sortBy,
                    sortOrder: 'desc'
                });

                const resp = await fetch(`${API_BASE}/api/customers/all?${queryParams}`);
                const data = await resp.json();
                customers = data.customers;
            }

            let htmlContent = '';

            // Add upload filter banner if active
            if (activeUploadFilter) {
                htmlContent += `
                    <div class="upload-filter-banner">
                        <div class="upload-filter-info">
                            <i class="ph ph-funnel"></i>
                            <div>
                                <div>Viewing data from: <strong>${activeUploadFilter.fileName}</strong></div>
                                <div style="font-size: 0.85rem; opacity: 0.9;">Uploaded on ${new Date(activeUploadFilter.uploadedAt).toLocaleString()}</div>
                            </div>
                        </div>
                        <button id="clearUploadFilterBtn" class="btn-clear-filter">
                            <i class="ph ph-x"></i> Back to All Customers
                        </button>
                    </div>
                `;
            }

            // Add greeting banner for repeat customers
            if (filters.repeatOnly && customers.length > 0) {
                htmlContent += `
                    <div class="greeting-banner">
                        <i class="ph ph-hand-waving"></i>
                        <span>Greeting ${customers.length} repeat customer${customers.length !== 1 ? 's' : ''}! 🎉</span>
                    </div>
                `;
            }

            htmlContent += `
                <!-- Stats Cards -->
                <div class="glass-card">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon blue"><i class="ph ph-users"></i></div>
                            <div class="stat-label">Total Customers</div>
                            <div class="stat-value">${stats.totalCustomers}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon green"><i class="ph ph-user-plus"></i></div>
                            <div class="stat-label">First-Time Customers</div>
                            <div class="stat-value">${stats.newCustomers}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon pink"><i class="ph ph-arrows-clockwise"></i></div>
                            <div class="stat-label">Repeat Customers</div>
                            <div class="stat-value">${stats.repeatCustomers}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon purple"><i class="ph ph-package"></i></div>
                            <div class="stat-label">Total Orders</div>
                            <div class="stat-value">${stats.totalOrders}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon orange"><i class="ph ph-currency-inr"></i></div>
                            <div class="stat-label">Total Revenue</div>
                            <div class="stat-value">₹${stats.totalRevenue.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="glass-card">
                    <div class="card-header">
                        <h3><i class="ph ph-funnel"></i> Filters & Search</h3>
                    </div>
                    <div class="filters-section">
                        <div class="filters-row">
                            <div class="filter-group">
                                <label>Customer Type</label>
                                <select id="filterRepeatOnly" class="filter-input">
                                    <option value="false" ${!filters.repeatOnly ? 'selected' : ''}>All Customers</option>
                                    <option value="true" ${filters.repeatOnly ? 'selected' : ''}>Repeat Customers Only</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Search by Name</label>
                                <input type="text" id="filterName" class="filter-input" placeholder="Enter customer name" value="${filters.searchName}">
                            </div>
                            <div class="filter-group">
                                <label>Search by Phone</label>
                                <input type="text" id="filterPhone" class="filter-input" placeholder="Enter phone number" value="${filters.searchPhone}">
                            </div>
                            <div class="filter-group">
                                <label>Search by City</label>
                                <input type="text" id="filterCity" class="filter-input" placeholder="Enter city" value="${filters.searchCity}">
                            </div>
                            <div class="filter-group">
                                <label>Sort By</label>
                                <select id="filterSortBy" class="filter-input">
                                    <option value="totalOrders" ${filters.sortBy === 'totalOrders' ? 'selected' : ''}>Total Orders (High → Low)</option>
                                    <option value="totalSpent" ${filters.sortBy === 'totalSpent' ? 'selected' : ''}>Total Spent</option>
                                    <option value="lastOrderDate" ${filters.sortBy === 'lastOrderDate' ? 'selected' : ''}>Last Order Date</option>
                                </select>
                            </div>
                        </div>
                        <div class="filter-buttons">
                            <button id="applyFiltersBtn" class="btn-primary"><i class="ph ph-funnel-simple"></i> Apply Filters</button>
                            <button id="clearFiltersBtn" class="btn-secondary"><i class="ph ph-x"></i> Clear</button>
                            <button id="downloadBtn" class="btn-secondary"><i class="ph ph-download-simple"></i> Download CSV</button>
                        </div>
                    </div>
                </div>

                <!-- Customer Table -->
                <div class="glass-card">
                    <div class="card-header">
                        <h3><i class="ph ph-table"></i> Customer Table (${customers.length})</h3>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Phone Number</th>
                                    <th>City</th>
                                    <th>Total Orders</th>
                                    <th>Repeat Customer</th>
                                    <th>All Products Purchased</th>
                                    <th>Last Order Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${customers.length === 0 ? `
                                    <tr>
                                        <td colspan="8" class="empty-state">
                                            <i class="ph ph-users"></i>
                                            <p>No customers found. Upload order data to get started.</p>
                                        </td>
                                    </tr>
                                ` : customers.map(c => `
                                    <tr class="${c.isRepeatCustomer ? 'repeat-customer' : ''}">
                                        <td><span class="customer-name">${c.name || '—'}</span></td>
                                        <td>${c.phone}</td>
                                        <td>${c.city || '—'}</td>
                                        <td><strong>${c.totalOrders}</strong></td>
                                        <td>
                                            <span class="badge ${c.isRepeatCustomer ? 'badge-repeat' : 'badge-new'}">
                                                ${c.isRepeatCustomer ? '🔄 Yes' : '✨ No'}
                                            </span>
                                        </td>
                                        <td>${(() => {
                    try {
                        const products = Array.isArray(c.productsBought) ? c.productsBought : [];
                        if (products && products.length > 0) {
                            return products.join(' | ');
                        }
                    } catch (e) {
                        console.error('Error displaying products:', e);
                    }
                    return 'N/A';
                })()}</td>
                                        <td>${c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—'}</td>
                                        <td>
                                            <button class="btn-details" data-phone="${c.phone}">
                                                <i class="ph ph-eye"></i> Details
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            customersSection.innerHTML = htmlContent;

            // Attach event listeners
            customersSection.querySelector('#applyFiltersBtn')?.addEventListener('click', () => {
                filters.repeatOnly = customersSection.querySelector('#filterRepeatOnly').value === 'true';
                filters.searchName = customersSection.querySelector('#filterName').value;
                filters.searchPhone = customersSection.querySelector('#filterPhone').value;
                filters.searchCity = customersSection.querySelector('#filterCity').value;
                filters.sortBy = customersSection.querySelector('#filterSortBy').value;
                loadCustomerTable();
            });

            customersSection.querySelector('#clearFiltersBtn')?.addEventListener('click', () => {
                filters = { repeatOnly: false, searchPhone: '', searchName: '', searchCity: '', sortBy: 'totalOrders' };
                loadCustomerTable();
            });

            // Download CSV button
            customersSection.querySelector('#downloadBtn')?.addEventListener('click', async () => {
                try {
                    const queryParams = new URLSearchParams({
                        repeatOnly: filters.repeatOnly.toString(),
                        searchPhone: filters.searchPhone,
                        searchName: filters.searchName,
                        searchCity: filters.searchCity,
                        sortBy: filters.sortBy,
                        sortOrder: 'desc',
                        format: 'csv'
                    });

                    // Add uploadId if viewing specific upload
                    if (activeUploadFilter) {
                        queryParams.append('uploadId', activeUploadFilter.id);
                    }

                    // Trigger download
                    window.location.href = `${API_BASE}/api/customers/export-filtered?${queryParams}`;
                } catch (err) {
                    alert('Error downloading data: ' + err.message);
                }
            });

            // Clear upload filter button
            customersSection.querySelector('#clearUploadFilterBtn')?.addEventListener('click', () => {
                activeUploadFilter = null;
                loadCustomerTable();
            });

            // Enter key support
            ['filterName', 'filterPhone', 'filterCity'].forEach(id => {
                customersSection.querySelector(`#${id}`)?.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        customersSection.querySelector('#applyFiltersBtn').click();
                    }
                });
            });

            // Details buttons
            customersSection.querySelectorAll('.btn-details').forEach(btn => {
                btn.addEventListener('click', () => {
                    showCustomerDetail(btn.getAttribute('data-phone'));
                });
            });

        } catch (err) {
            customersSection.innerHTML = `<div class="glass-card" style="padding: 2rem; color: #ef4444;">Error loading customers: ${err.message}</div>`;
        }
    }

    // Show customer detail modal
    async function showCustomerDetail(phone) {
        try {
            const resp = await fetch(`${API_BASE}/api/customers/phone/${phone}`);
            const customer = await resp.json();

            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="ph ph-user"></i> ${customer.name || 'Customer Details'}</h2>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <!-- Customer Badge -->
                        <div style="margin-bottom: 1.5rem;">
                            <span class="badge ${customer.isRepeatCustomer ? 'badge-returning' : 'badge-first-time'}" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
                                ${customer.isRepeatCustomer ? '🔄 Returning Customer' : '🌟 First-Time Customer'}
                            </span>
                        </div>

                        <!-- Customer Info Grid -->
                        <div class="customer-details-grid">
                            <div class="detail-item">
                                <div class="detail-label">Customer Name</div>
                                <div class="detail-value">${customer.name || '—'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Phone Number</div>
                                <div class="detail-value">${customer.phone}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">City</div>
                                <div class="detail-value">${customer.city || '—'}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Total Orders</div>
                                <div class="detail-value">${customer.totalOrders}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Total Spent</div>
                                <div class="detail-value">₹${customer.totalSpent.toFixed(2)}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">First Order</div>
                                <div class="detail-value">${customer.firstOrderDate ? new Date(customer.firstOrderDate).toLocaleDateString() : '—'}</div>
                            </div>
                        </div>

                        <!-- Products -->
                        <h3 style="margin: 0 0 1rem; color: #1e293b;"><i class="ph ph-shopping-bag"></i> Products Purchased</h3>
                        <div class="products-list" style="margin-bottom: 2rem;">
                            ${customer.productsBought.map(p => `<span class="product-tag">${p}</span>`).join('')}
                        </div>

                        <!-- Order History -->
                        <h3 style="margin: 0 0 1rem; color: #1e293b;"><i class="ph ph-receipt"></i> Order History</h3>
                        <div style="overflow-x: auto;">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Product Name</th>
                                        <th>City</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${customer.orders.map(o => `
                                        <tr>
                                            <td><strong>${o.orderId}</strong></td>
                                            <td>${o.productName}</td>
                                            <td>${o.city || '—'}</td>
                                            <td>${new Date(o.orderDate).toLocaleDateString()}</td>
                                            <td><strong>₹${o.orderAmount.toFixed(2)}</strong></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        } catch (err) {
            alert('Error loading customer details: ' + err.message);
        }
    }

    // Load upload history
    async function loadUploadHistory() {
        uploadsSection.innerHTML = '<div class="loading"><i class="ph ph-spinner" style="animation: spin 1s linear infinite;"></i> Loading uploads...</div>';

        try {
            const resp = await fetch(`${API_BASE}/api/customers/uploads`);
            const uploads = await resp.json();

            uploadsSection.innerHTML = `
                <div class="glass-card">
                    <div class="card-header">
                        <h3><i class="ph ph-clock-counter-clockwise"></i> Upload History</h3>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>File Name</th>
                                    <th>Status</th>
                                    <th>Total Rows</th>
                                    <th>Customers</th>
                                    <th>Uploaded</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${uploads.length === 0 ? `
                                    <tr>
                                        <td colspan="7" class="empty-state">
                                            <p>No uploads yet. Upload a CSV to get started.</p>
                                        </td>
                                    </tr>
                                ` : uploads.map(u => `
                                    <tr class="upload-row" data-upload-id="${u.id}" data-upload-filename="${u.fileName}" data-upload-date="${u.uploadedAt}">
                                        <td><strong>#${u.id}</strong></td>
                                        <td>${u.fileName}</td>
                                        <td>
                                            <span class="badge ${u.status === 'SUCCESS' ? 'badge-new' : u.status === 'FAILED' ? 'badge-repeat' : 'badge-returning'}">
                                                ${u.status}
                                            </span>
                                        </td>
                                        <td>${u.totalRows || '—'}</td>
                                        <td>${u.customerCount || 0}</td>
                                        <td>${new Date(u.uploadedAt).toLocaleString()}</td>
                                        <td>
                                            <button class="btn-delete" data-upload-id="${u.id}" data-upload-filename="${u.fileName}" onclick="event.stopPropagation();">
                                                <i class="ph ph-trash"></i> Delete
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            // Add click event to upload rows
            uploadsSection.querySelectorAll('.upload-row').forEach(row => {
                row.addEventListener('click', () => {
                    const uploadId = parseInt(row.getAttribute('data-upload-id'));
                    const fileName = row.getAttribute('data-upload-filename');
                    const uploadedAt = row.getAttribute('data-upload-date');

                    // Set active upload filter
                    activeUploadFilter = {
                        id: uploadId,
                        fileName: fileName,
                        uploadedAt: uploadedAt
                    };

                    // Switch to customer table tab
                    currentTab = 'customers';
                    customersSection.style.display = 'block';
                    uploadsSection.style.display = 'none';

                    // Update tab buttons
                    container.querySelectorAll('.tab-btn').forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-tab') === 'customers') {
                            btn.classList.add('active');
                        }
                    });

                    // Load customer data for this upload
                    loadCustomerTable();
                });
            });

            // Add delete button event listeners
            uploadsSection.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation(); // Prevent row click

                    const uploadId = btn.getAttribute('data-upload-id');
                    const fileName = btn.getAttribute('data-upload-filename');

                    if (!confirm(`Are you sure you want to delete "${fileName}"?\n\nThis will permanently remove:\n• The upload record\n• All customer analysis data for this upload\n• All order records from this upload\n\nGlobal customer stats will be recalculated.`)) {
                        return;
                    }

                    try {
                        btn.disabled = true;
                        btn.innerHTML = '<i class="ph ph-spinner" style="animation: spin 1s linear infinite;"></i> Deleting...';

                        const resp = await fetch(`${API_BASE}/api/customers/uploads/${uploadId}`, {
                            method: 'DELETE'
                        });

                        const result = await resp.json();

                        if (result.success) {
                            alert(`✅ Upload deleted successfully!\n\nDeleted:\n• ${result.deletedRecords.analysisRecords} analysis records\n• ${result.deletedRecords.orderRecords} order records\n• Affected ${result.affectedCustomers} customers`);

                            // Clear active upload filter if it was the deleted one
                            if (activeUploadFilter && activeUploadFilter.id === parseInt(uploadId)) {
                                activeUploadFilter = null;
                            }

                            // Reload upload history
                            loadUploadHistory();

                            // Reload customer table if on that tab
                            if (currentTab === 'customers') {
                                loadCustomerTable();
                            }
                        } else {
                            alert('❌ Error: ' + result.error);
                            btn.disabled = false;
                            btn.innerHTML = '<i class="ph ph-trash"></i> Delete';
                        }
                    } catch (err) {
                        alert('❌ Delete error: ' + err.message);
                        btn.disabled = false;
                        btn.innerHTML = '<i class="ph ph-trash"></i> Delete';
                    }
                });
            });
        } catch (err) {
            uploadsSection.innerHTML = `<div class="glass-card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
        }
    }

    // Upload modal
    setTimeout(() => {
        container.querySelector('#uploadCSVBtn')?.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2><i class="ph ph-upload-simple"></i> Upload Shopify Orders CSV</h2>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <div style="background: linear-gradient(135deg, #e0e7ff, #c7d2fe); padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem;">
                            <h4 style="margin: 0 0 0.75rem; color: #4338ca;"><i class="ph ph-info"></i> Required Shopify CSV Columns</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.85rem;">
                                <div>
                                    <strong style="color: #4338ca;">Required:</strong>
                                    <ul style="margin: 0.25rem 0 0; padding-left: 1.25rem;">
                                        <li><strong>Name</strong> (Order ID)</li>
                                        <li><strong>Billing Phone</strong></li>
                                    </ul>
                                </div>
                                <div>
                                    <strong style="color: #6b7280;">Auto-mapped:</strong>
                                    <ul style="margin: 0.25rem 0 0; padding-left: 1.25rem;">
                                        <li><strong>Billing Name</strong> → Customer</li>
                                        <li><strong>Lineitem Name</strong> → Product</li>
                                        <li><strong>Shipping City</strong> → City</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="filter-group" style="margin-bottom: 1rem;">
                            <label>CSV Content</label>
                            <textarea id="csvContent" class="filter-input" placeholder="Paste CSV content here..." style="height: 200px; font-family: monospace;"></textarea>
                        </div>

                        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; align-items: center;">
                            <input type="file" id="csvFile" accept=".csv" style="display: none;">
                            <button id="chooseFileBtn" class="btn-secondary"><i class="ph ph-file-csv"></i> Choose File</button>
                            <span id="fileName" style="color: #64748b; font-size: 0.9rem;">No file selected</span>
                        </div>

                        <div style="display: flex; gap: 0.75rem;">
                            <button id="uploadBtn" class="btn-primary" style="flex: 1;">
                                <i class="ph ph-upload-simple"></i> Upload & Process
                            </button>
                            <button id="cancelBtn" class="btn-secondary" style="flex: 1;">Cancel</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const fileInput = modal.querySelector('#csvFile');
            const csvContent = modal.querySelector('#csvContent');
            const fileNameSpan = modal.querySelector('#fileName');

            modal.querySelector('#chooseFileBtn').addEventListener('click', () => fileInput.click());

            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    fileNameSpan.textContent = file.name;
                    csvContent.value = await file.text();
                }
            });

            modal.querySelector('#uploadBtn').addEventListener('click', async () => {
                const content = csvContent.value.trim();
                if (!content) {
                    alert('Please enter or select CSV content');
                    return;
                }

                const btn = modal.querySelector('#uploadBtn');
                btn.disabled = true;
                btn.innerHTML = '<i class="ph ph-spinner" style="animation: spin 1s linear infinite;"></i> Processing...';

                try {
                    const resp = await fetch(`${API_BASE}/api/customers/upload-csv`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ csvContent: content })
                    });

                    const result = await resp.json();

                    if (result.success) {
                        alert(`✅ Upload successful!\n\nUpload ID: ${result.uploadId}\nTotal Customers: ${result.totalCustomers || 0}\nNew: ${result.newCustomers || 0}\nRepeat: ${result.repeatCustomers || 0}`);
                        modal.remove();
                        loadCustomerTable();
                    } else {
                        alert('❌ Error: ' + result.error);
                    }
                } catch (err) {
                    alert('❌ Upload error: ' + err.message);
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="ph ph-upload-simple"></i> Upload & Process';
                }
            });

            modal.querySelector('#cancelBtn').addEventListener('click', () => modal.remove());
            modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        });
    }, 100);

    // Initial load
    loadCustomerTable();

    return container;
}
