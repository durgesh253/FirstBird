const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const SHOP = 'firstbud';
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || 'your_token_here';
const API_VERSION = '2025-01';
const BASE_URL = `https://${SHOP}.myshopify.com/admin/api/${API_VERSION}/graphql.json`;

async function fetchGraphQL(query) {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    });
    return await response.json();
}

async function debugGraphQL() {
    console.log('🔍 Checking Shopify Data via GraphQL...');
    const query = `{
        orders(first: 1) {
            edges {
                node {
                    name
                    customer {
                        firstName
                        lastName
                        email
                        phone
                    }
                }
            }
        }
    }`;

    try {
        const result = await fetchGraphQL(query);
        console.log(JSON.stringify(result, null, 2));

        if (result.errors) {
            console.log('\n❌ GRAPHQL ERRORS FOUND:');
            result.errors.forEach(e => console.log(`- ${e.message}`));
        } else {
            const order = result.data.orders.edges[0]?.node;
            if (order && !order.customer) {
                console.log('\n⚠️ Customer Info is STILL NULL even in GraphQL.');
            }
        }
    } catch (err) {
        console.error('❌ Error fetching GraphQL:', err.message);
    }
}

debugGraphQL();
