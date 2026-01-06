import { api } from '../services/api';

export function SubscriptionPlans() {
    const container = document.createElement('div');
    container.className = 'subscriptions-page';

    const API_BASE = (location.hostname === 'localhost') ? 'http://localhost:3000' : '';

    // Styles
    const styles = document.createElement('style');
    styles.textContent = `
        .subscriptions-page {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            border-radius: 16px;
            color: white;
            box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
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

        .btn-sync {
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

        .btn-sync:hover {
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
            color: #059669;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

        .stat-icon.green { background: linear-gradient(135deg, #059669, #10b981); color: white; }
        .stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
        .stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; }
        .stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }

        .stat-label {
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
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
            gap: 1rem;
            flex-wrap: wrap;
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
            border-color: #059669;
            background: white;
        }

        .btn-primary {
            background: linear-gradient(135deg, #059669, #10b981);
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
            box-shadow: 0 5px 20px rgba(16, 185, 129, 0.4);
        }

        .btn-secondary {
            background: white;
            color: #475569;
            border: 2px solid #e2e8f0;
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
        }

        .btn-secondary:hover {
            border-color: #059669;
            color: #059669;
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

        .data-table tbody tr:hover {
            background: #f8fafc;
        }

        .product-name {
            font-weight: 600;
            color: #1e293b;
        }

        .price-tag {
            background: linear-gradient(135deg, #059669, #10b981);
            color: white;
            padding: 0.35rem 0.75rem;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.85rem;
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

        .badge-active {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
        }

        .badge-inactive {
            background: #f1f5f9;
            color: #64748b;
        }

        .badge-monthly {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
        }

        .btn-view {
            background: linear-gradient(135deg, #059669, #10b981);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-right: 0.5rem;
        }

        .btn-view:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }

        .btn-delete {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-delete:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
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
            background: linear-gradient(135deg, #059669, #10b981);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h2 {
            margin: 0;
            font-size: 1.25rem;
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

        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .info-item {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 12px;
        }

        .info-label {
            font-size: 0.75rem;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
        }

        .info-value {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1e293b;
            margin-top: 0.25rem;
        }

        .top-products {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }

        .top-product-card {
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            padding: 1rem;
            border-radius: 12px;
            border: 1px solid #86efac;
        }

        .top-product-name {
            font-weight: 600;
            color: #166534;
            margin-bottom: 0.5rem;
        }

        .top-product-stats {
            font-size: 0.85rem;
            color: #15803d;
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: #64748b;
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

        .auto-badge {
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 600;
            margin-left: 0.5rem;
        }
    `;
    container.appendChild(styles);

    // State
    let currentTab = 'products';
    let filters = {
        isActive: null,
        searchProduct: ''
    };

    // Header
    container.innerHTML += `
        <div class="page-header">
            <div>
                <h1><i class="ph ph-credit-card"></i> Subscription Plans</h1>
                <p>Automatic product-based subscriptions • No manual setup required</p>
            </div>
            <button id="syncBtn" class="btn-sync">
                <i class="ph ph-arrows-clockwise"></i>
                Sync from Orders
            </button>
        </div>
    `;

    // Tabs
    container.insertAdjacentHTML('beforeend', `
        <div class="tabs-container">
            <button class="tab-btn active" data-tab="products">
                <i class="ph ph-package"></i> Product Subscriptions
            </button>
            <button class="tab-btn" data-tab="customers">
                <i class="ph ph-users"></i> Customer Subscriptions
            </button>
        </div>
    `);

    // Content
    const productsSection = document.createElement('div');
    productsSection.id = 'productsSection';
    container.appendChild(productsSection);

    const customersSection = document.createElement('div');
    customersSection.id = 'customersSection';
    customersSection.style.display = 'none';
    container.appendChild(customersSection);

    // Tab switching
    setTimeout(() => {
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTab = btn.getAttribute('data-tab');

                if (currentTab === 'products') {
                    productsSection.style.display = 'block';
                    customersSection.style.display = 'none';
                    loadProductSubscriptions();
                } else {
                    productsSection.style.display = 'none';
                    customersSection.style.display = 'block';
                    loadCustomerSubscriptions();
                }
            });
        });

        // Sync button
        container.querySelector('#syncBtn')?.addEventListener('click', async () => {
            const btn = container.querySelector('#syncBtn');
            btn.disabled = true;
            btn.innerHTML = '<i class="ph ph-spinner" style="animation: spin 1s linear infinite;"></i> Syncing...';

            try {
                const resp = await fetch(`${API_BASE}/api/subscriptions/sync`, { method: 'POST' });
                const result = await resp.json();
                alert(`✅ ${result.message}`);
                loadProductSubscriptions();
            } catch (err) {
                alert('❌ Sync failed: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Sync from Orders';
            }
        });
    }, 100);

    // Load product subscriptions
    async function loadProductSubscriptions() {
        productsSection.innerHTML = '<div class="loading"><i class="ph ph-spinner" style="animation: spin 1s linear infinite;"></i> Loading subscriptions...</div>';

        try {
            // Get stats
            const statsResp = await fetch(`${API_BASE}/api/subscriptions/stats`);
            const stats = await statsResp.json();

            // Get subscriptions
            const queryParams = new URLSearchParams({
                sortBy: 'totalSubscribers',
                sortOrder: 'desc'
            });
            if (filters.isActive !== null) queryParams.set('isActive', filters.isActive);
            if (filters.searchProduct) queryParams.set('searchProduct', filters.searchProduct);

            const subsResp = await fetch(`${API_BASE}/api/subscriptions?${queryParams}`);
            const { subscriptions } = await subsResp.json();

            productsSection.innerHTML = `
                <!-- Stats -->
                <div class="glass-card">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon green"><i class="ph ph-package"></i></div>
                            <div class="stat-label">Total Products</div>
                            <div class="stat-value">${stats.totalProducts || 0}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon blue"><i class="ph ph-users"></i></div>
                            <div class="stat-label">Total Subscribers</div>
                            <div class="stat-value">${stats.totalSubscribers || 0}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon purple"><i class="ph ph-user-check"></i></div>
                            <div class="stat-label">Active Subscribers</div>
                            <div class="stat-value">${stats.activeSubscribers || 0}</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon orange"><i class="ph ph-currency-inr"></i></div>
                            <div class="stat-label">Total Revenue</div>
                            <div class="stat-value">₹${(stats.totalRevenue || 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <!-- Top Products -->
                ${stats.topProducts && stats.topProducts.length > 0 ? `
                <div class="glass-card">
                    <div class="card-header">
                        <h3><i class="ph ph-trophy"></i> Top Products by Subscribers</h3>
                    </div>
                    <div style="padding: 1.5rem;">
                        <div class="top-products">
                            ${stats.topProducts.map((p, i) => `
                                <div class="top-product-card">
                                    <div class="top-product-name">${i + 1}. ${p.productName}</div>
                                    <div class="top-product-stats">
                                        👥 ${p.subscribers} subscribers • ₹${p.price}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Filters -->
                <div class="glass-card">
                    <div class="card-header">
                        <h3><i class="ph ph-funnel"></i> Filters</h3>
                    </div>
                    <div class="filters-section">
                        <div class="filter-group">
                            <label>Status</label>
                            <select id="filterActive" class="filter-input">
                                <option value="">All</option>
                                <option value="true" ${filters.isActive === true ? 'selected' : ''}>Active</option>
                                <option value="false" ${filters.isActive === false ? 'selected' : ''}>Inactive</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label>Search Product</label>
                            <input type="text" id="filterSearch" class="filter-input" placeholder="Product name..." value="${filters.searchProduct}">
                        </div>
                        <button id="applyFiltersBtn" class="btn-primary"><i class="ph ph-funnel-simple"></i> Apply</button>
                        <button id="clearFiltersBtn" class="btn-secondary"><i class="ph ph-x"></i> Clear</button>
                    </div>
                </div>

                <!-- Subscriptions Table -->
                <div class="glass-card">
                    <div class="card-header">
                        <h3><i class="ph ph-table"></i> Product Subscriptions (${subscriptions.length})</h3>
                        <span class="auto-badge">AUTO-GENERATED</span>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>Price</th>
                                    <th>Billing</th>
                                    <th>Subscribers</th>
                                    <th>Revenue</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${subscriptions.length === 0 ? `
                                    <tr>
                                        <td colspan="8" class="empty-state">
                                            <p>No subscriptions yet. Upload order data to auto-create subscriptions.</p>
                                        </td>
                                    </tr>
                                ` : subscriptions.map(s => `
                                    <tr>
                                        <td><span class="product-name">${s.productName}</span></td>
                                        <td><span class="price-tag">₹${s.price.toFixed(2)}</span></td>
                                        <td><span class="badge badge-monthly">${s.billingInterval}</span></td>
                                        <td><strong>${s.totalSubscribers}</strong></td>
                                        <td>₹${s.totalRevenue.toFixed(2)}</td>
                                        <td>
                                            <span class="badge ${s.isActive ? 'badge-active' : 'badge-inactive'}">
                                                ${s.isActive ? '✓ Active' : '○ Inactive'}
                                            </span>
                                        </td>
                                        <td>${new Date(s.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button class="btn-view" data-product="${encodeURIComponent(s.productName)}">
                                                <i class="ph ph-eye"></i> View
                                            </button>
                                            <button class="btn-delete" data-product="${encodeURIComponent(s.productName)}" data-id="${s.id}">
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

            // Event listeners
            productsSection.querySelector('#applyFiltersBtn')?.addEventListener('click', () => {
                const activeVal = productsSection.querySelector('#filterActive').value;
                filters.isActive = activeVal === 'true' ? true : activeVal === 'false' ? false : null;
                filters.searchProduct = productsSection.querySelector('#filterSearch').value;
                loadProductSubscriptions();
            });

            productsSection.querySelector('#clearFiltersBtn')?.addEventListener('click', () => {
                filters = { isActive: null, searchProduct: '' };
                loadProductSubscriptions();
            });

            productsSection.querySelectorAll('.btn-view').forEach(btn => {
                btn.addEventListener('click', () => {
                    showProductDetail(decodeURIComponent(btn.getAttribute('data-product')));
                });
            });

            productsSection.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const productName = decodeURIComponent(btn.getAttribute('data-product'));
                    const subscriptionId = btn.getAttribute('data-id');

                    if (!confirm(`Are you sure you want to delete the subscription for "${productName}"?\n\nThis will remove the subscription plan and all associated customer subscriptions.`)) {
                        return;
                    }

                    try {
                        btn.disabled = true;
                        btn.innerHTML = '<i class="ph ph-spinner" style="animation: spin 1s linear infinite;"></i> Deleting...';

                        const resp = await fetch(`${API_BASE}/api/subscriptions/${subscriptionId}`, {
                            method: 'DELETE'
                        });

                        if (!resp.ok) {
                            const error = await resp.json();
                            throw new Error(error.error || 'Failed to delete subscription');
                        }

                        const result = await resp.json();
                        alert(`✅ ${result.message}`);
                        loadProductSubscriptions();
                    } catch (err) {
                        alert('❌ Error: ' + err.message);
                        btn.disabled = false;
                        btn.innerHTML = '<i class="ph ph-trash"></i> Delete';
                    }
                });
            });

        } catch (err) {
            productsSection.innerHTML = `<div class="glass-card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
        }
    }

    // Show product subscription detail
    async function showProductDetail(productName) {
        try {
            const resp = await fetch(`${API_BASE}/api/subscriptions/product/${encodeURIComponent(productName)}`);
            const subscription = await resp.json();

            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="ph ph-package"></i> ${subscription.productName}</h2>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Price</div>
                                <div class="info-value">₹${subscription.price.toFixed(2)}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Billing Interval</div>
                                <div class="info-value">${subscription.billingInterval}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Total Subscribers</div>
                                <div class="info-value">${subscription.totalSubscribers}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Total Revenue</div>
                                <div class="info-value">₹${subscription.totalRevenue.toFixed(2)}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Status</div>
                                <div class="info-value">
                                    <span class="badge ${subscription.isActive ? 'badge-active' : 'badge-inactive'}">
                                        ${subscription.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Created</div>
                                <div class="info-value">${new Date(subscription.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <h3 style="margin: 0 0 1rem;"><i class="ph ph-users"></i> Recent Subscribers</h3>
                        ${subscription.customerSubscriptions && subscription.customerSubscriptions.length > 0 ? `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Phone</th>
                                        <th>Status</th>
                                        <th>Orders</th>
                                        <th>Spent</th>
                                        <th>Start Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${subscription.customerSubscriptions.map(cs => `
                                        <tr>
                                            <td>${cs.customerPhone}</td>
                                            <td><span class="badge ${cs.status === 'active' ? 'badge-active' : 'badge-inactive'}">${cs.status}</span></td>
                                            <td>${cs.totalOrdersOnPlan}</td>
                                            <td>₹${parseFloat(cs.totalSpentOnPlan || 0).toFixed(2)}</td>
                                            <td>${new Date(cs.startDate).toLocaleDateString()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<p style="color: #64748b;">No subscribers yet</p>'}
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        } catch (err) {
            alert('Error: ' + (err.error || err.message));
        }
    }

    // Load customer subscriptions
    async function loadCustomerSubscriptions() {
        customersSection.innerHTML = '<div class="loading"><i class="ph ph-spinner" style="animation: spin 1s linear infinite;"></i> Loading customer subscriptions...</div>';

        try {
            // Get all customers and fetch their subscriptions
            const customersResp = await fetch(`${API_BASE}/api/customers/all?limit=50`);
            const { customers } = await customersResp.json();

            customersSection.innerHTML = `
                <div class="glass-card">
                    <div class="card-header">
                        <h3><i class="ph ph-users"></i> Customer Subscriptions</h3>
                    </div>
                    <div style="padding: 1.5rem;">
                        <div class="filter-group" style="max-width: 300px; margin-bottom: 1rem;">
                            <label>Search by Phone</label>
                            <input type="text" id="customerPhoneSearch" class="filter-input" placeholder="Enter phone number...">
                        </div>
                        <button id="searchCustomerBtn" class="btn-primary">Search</button>
                    </div>
                    <div id="customerSubsResults">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Total Orders</th>
                                    <th>Subscriptions</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${customers.slice(0, 20).map(c => `
                                    <tr>
                                        <td><strong>${c.name || 'Unknown'}</strong></td>
                                        <td>${c.phone}</td>
                                        <td>${c.totalOrders}</td>
                                        <td>-</td>
                                        <td>
                                            <button class="btn-view" data-phone="${c.phone}">
                                                <i class="ph ph-eye"></i> View Subscriptions
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            customersSection.querySelector('#searchCustomerBtn')?.addEventListener('click', async () => {
                const phone = customersSection.querySelector('#customerPhoneSearch').value;
                if (phone) {
                    showCustomerSubscriptions(phone);
                }
            });

            customersSection.querySelectorAll('.btn-view').forEach(btn => {
                btn.addEventListener('click', () => {
                    showCustomerSubscriptions(btn.getAttribute('data-phone'));
                });
            });

        } catch (err) {
            customersSection.innerHTML = `<div class="glass-card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
        }
    }

    // Show customer subscriptions modal
    async function showCustomerSubscriptions(phone) {
        try {
            const resp = await fetch(`${API_BASE}/api/subscriptions/customer/${phone}?includeInactive=true`);
            const { subscriptions } = await resp.json();

            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="ph ph-user"></i> Subscriptions for ${phone}</h2>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        ${subscriptions.length === 0 ? `
                            <div class="empty-state">
                                <p>No subscriptions found for this customer</p>
                            </div>
                        ` : `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Orders</th>
                                        <th>Total Spent</th>
                                        <th>Start Date</th>
                                        <th>Next Billing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${subscriptions.map(s => `
                                        <tr>
                                            <td><strong>${s.productName}</strong></td>
                                            <td><span class="price-tag">₹${s.price.toFixed(2)}</span></td>
                                            <td>
                                                <span class="badge ${s.status === 'active' ? 'badge-active' : 'badge-inactive'}">
                                                    ${s.status === 'active' ? '🟢 Active' : s.status}
                                                </span>
                                            </td>
                                            <td>${s.totalOrdersOnPlan}</td>
                                            <td>₹${s.totalSpentOnPlan.toFixed(2)}</td>
                                            <td>${new Date(s.startDate).toLocaleDateString()}</td>
                                            <td>${s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString() : '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        `}
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    // Initial load
    loadProductSubscriptions();

    return container;
}
