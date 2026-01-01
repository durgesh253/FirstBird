require('dotenv').config();
const { syncShopifyData } = require('./src/services/sync-service');

async function test() {
    const domain = process.env.SHOPIFY_SHOP || 'firstbud.myshopify.com';
    const finalDomain = domain.includes('.myshopify.com') ? domain : `${domain}.myshopify.com`;
    console.log(`Starting PII-compliant test sync for ${finalDomain}...`);
    await syncShopifyData(finalDomain);
    console.log('Sync finished. Please check the dashboard for names/phones.');
    process.exit(0);
}

test();
