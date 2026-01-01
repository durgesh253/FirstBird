const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const SHOP = 'firstbud';
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || 'your_token_here';
const API_VERSION = '2025-01';
const BASE_URL = `https://${SHOP}.myshopify.com/admin/api/${API_VERSION}`;

async function fetchShopify(endpoint) {
    const url = `${BASE_URL}/${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN,
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
}

async function debugCustomers() {
    console.log('🔍 Checking Shopify Customers API Directly...');
    try {
        const data = await fetchShopify('customers.json?limit=5');
        const customers = data.customers;

        if (!customers || customers.length === 0) {
            return console.log('❌ No customers found or API access denied.');
        }

        for (const c of customers) {
            console.log(`\nCustomer ID: ${c.id}`);
            console.log(`   Name: ${c.first_name || 'REDACTED'} ${c.last_name || ''}`);
            console.log(`   Email: ${c.email || 'REDACTED'}`);
            console.log(`   Phone: ${c.phone || 'REDACTED'}`);
        }
    } catch (err) {
        console.error('❌ Error fetching customers:', err.message);
    }
}

debugCustomers();
