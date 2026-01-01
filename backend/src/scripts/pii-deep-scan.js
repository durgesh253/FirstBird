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

async function deepScan() {
    console.log('🔍 Deep scanning last 50 orders for ANY customer data...');
    try {
        const data = await fetchShopify('orders.json?limit=50&status=any');
        const orders = data.orders;

        if (!orders || orders.length === 0) {
            return console.log('❌ No orders found.');
        }

        let foundPII = 0;
        let total = orders.length;

        for (const order of orders) {
            const name = order.customer?.first_name || order.shipping_address?.first_name || order.billing_address?.first_name;
            const email = order.email || order.customer?.email;

            if (name || email) {
                console.log(`✅ [FOUND] Order #${order.order_number}: Name=${name || '?'}, Email=${email || '?'}`);
                foundPII++;
            }
        }

        if (foundPII === 0) {
            console.log('\n❌ RESULT: All 50 orders are still 100% REDACTED.');
            console.log('This confirms Shopify is still blocking access despite the changes.');
        } else {
            console.log(`\n🎉 RESULT: Found ${foundPII}/${total} orders with data! Running sync now...`);
        }
    } catch (err) {
        console.error('❌ Scan error:', err.message);
    }
}

deepScan();
