require('dotenv').config();
const app = require('./app');
const port = process.env.PORT || 3000;

const { ensureDefaultShop } = require('./services/attribution');
const { syncShopifyData } = require('./services/sync-service');

// Start Server
async function start() {
    await ensureDefaultShop();

    // Background Sync (Every 5 minutes)
    const domain = process.env.SHOPIFY_SHOP || 'firstbud.myshopify.com';
    const finalDomain = domain.includes('.myshopify.com') ? domain : `${domain}.myshopify.com`;

    // Initial sync
    syncShopifyData(finalDomain);

    // Poll every 5 minutes
    setInterval(() => {
        syncShopifyData(finalDomain);
    }, 5 * 60 * 1000);

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

start();
