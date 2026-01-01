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

async function debugOrder() {
    console.log('🔍 Fetching the most recent order to check for data release...');
    try {
        const data = await fetchShopify('orders.json?limit=1&status=any');
        const order = data.orders[0];

        if (!order) {
            return console.log('❌ No orders found in this shop.');
        }

        console.log(`\n--- ORDER #${order.order_number} (${order.id}) ---`);

        console.log('\n1. Root Level Info:');
        console.log(`   Email: ${order.email || 'NULL'}`);
        console.log(`   Phone: ${order.phone || 'NULL'}`);
        console.log(`   Contact Email: ${order.contact_email || 'NULL'}`);

        console.log('\n2. Customer Object:');
        if (order.customer) {
            console.log(JSON.stringify(order.customer, null, 2));
        } else {
            console.log('   MISSING');
        }

        console.log('\n3. Shipping Address:');
        if (order.shipping_address) {
            console.log(JSON.stringify(order.shipping_address, null, 2));
        } else {
            console.log('   MISSING');
        }

        console.log('\n4. Billing Address:');
        if (order.billing_address) {
            console.log(JSON.stringify(order.billing_address, null, 2));
        } else {
            console.log('   MISSING');
        }
    } catch (err) {
        console.error('❌ Error debugging:', err);
    }
}

debugOrder();
