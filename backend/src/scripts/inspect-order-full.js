const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const fs = require('fs');

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

async function dumpOrder() {
    console.log('📦 Fetching the single most recent order...');
    try {
        const data = await fetchShopify('orders.json?limit=1&status=any');
        const order = data.orders[0];

        if (!order) {
            return console.log('❌ No orders found.');
        }

        const outputPath = path.join(__dirname, 'raw-order-debug.json');
        fs.writeFileSync(outputPath, JSON.stringify(order, null, 2));

        console.log('\n✅ SUCCESS!');
        console.log(`The full raw data has been saved to: ${outputPath}`);
        console.log('\nImportant findings already visible:');
        console.log(`- Order Number: ${order.order_number}`);
        console.log(`- Email: ${order.email || 'NULL/EMPTY'}`);
        console.log(`- Customer Name: ${order.customer ? order.customer.first_name : 'Customer object missing'}`);
        console.log(`- Shipping Name: ${order.shipping_address ? order.shipping_address.name : 'Shipping Address missing'}`);

    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

dumpOrder();
