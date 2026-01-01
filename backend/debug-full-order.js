const path = require('path');
require('dotenv').config({ path: path.join(__dirname, './.env') });

const SHOP = 'firstbud';
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || 'your_token_here';
const API_VERSION = '2025-01';
const BASE_URL = `https://${SHOP}.myshopify.com/admin/api/${API_VERSION}`;

async function debugFullOrder() {
    try {
        const res = await fetch(`${BASE_URL}/orders.json?limit=1&status=any`, {
            headers: {
                'X-Shopify-Access-Token': ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });
        const data = await res.json();
        const order = data.orders[0];

        console.log('=== ORDER ID:', order.id);
        console.log('\n=== Shipping Address (all fields) ===');
        console.log(JSON.stringify(order.shipping_address, null, 2));

        console.log('\n=== Billing Address (all fields) ===');
        console.log(JSON.stringify(order.billing_address, null, 2));

        console.log('\n=== Customer Object (all fields) ===');
        console.log(JSON.stringify(order.customer, null, 2));

        console.log('\n=== Top Level Phone Fields ===');
        console.log('order.phone:', order.phone);
        console.log('order.email:', order.email);
        console.log('order.contact_email:', order.contact_email);

        console.log('\n=== Fulfillments ===');
        if (order.fulfillments && order.fulfillments.length > 0) {
            console.log(JSON.stringify(order.fulfillments[0], null, 2));
        } else {
            console.log('No fulfillments');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

debugFullOrder();
