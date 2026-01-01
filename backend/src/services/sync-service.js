const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { processOrderWebhook } = require('./attribution');

async function syncShopifyData(shopifyDomain) {
    try {
        console.log(`[Sync] Starting sync for ${shopifyDomain}...`);
        const shop = await prisma.shop.findUnique({
            where: { shopifyDomain }
        });

        if (!shop) return console.error(`[Sync] Shop ${shopifyDomain} not found`);

        const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-01';
        const BASE_URL = `https://${shopifyDomain.replace('.myshopify.com', '')}.myshopify.com/admin/api/${API_VERSION}`;

        // Ensure we have a usable access token. If DB is missing it, try env var and persist.
        if (!shop.accessToken || shop.accessToken === 'test_token') {
            const envToken = process.env.SHOPIFY_ADMIN_TOKEN;
            if (envToken) {
                console.log('[Sync] Updating shop access token from environment variable');
                await prisma.shop.update({ where: { id: shop.id }, data: { accessToken: envToken } });
                shop.accessToken = envToken;
            } else {
                throw new Error('Missing Shopify access token for shop ' + shopifyDomain);
            }
        }

        const fetchShopify = async (endpoint) => {
            const url = `${BASE_URL}/${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'X-Shopify-Access-Token': shop.accessToken,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const body = await response.text().catch(() => '<non-text body>');
                throw new Error(`Shopify API Error: ${response.status} - ${body}`);
            }
            return await response.json();
        };

        // 1. Sync Coupons (Price Rules)
        try {
            const rulesData = await fetchShopify('price_rules.json');
            const priceRules = rulesData.price_rules || [];

            // Ensure a default campaign for imported coupons
            const defaultCampaign = await prisma.campaign.upsert({
                where: { id: 1 },
                update: {},
                create: {
                    name: 'General Promotion',
                    platformSource: 'Shopify',
                    shopId: shop.id
                }
            });

            for (const rule of priceRules) {
                const codesData = await fetchShopify(`price_rules/${rule.id}/discount_codes.json`);
                const codes = codesData.discount_codes || [];

                for (const dCode of codes) {
                    await prisma.coupon.upsert({
                        where: {
                            shopId_code: {
                                shopId: shop.id,
                                code: dCode.code
                            }
                        },
                        update: { status: 'Active' },
                        create: {
                            code: dCode.code,
                            shopId: shop.id,
                            campaignId: defaultCampaign.id,
                            status: 'Active'
                        }
                    });
                }
            }
        } catch (e) {
            console.error('[Sync] Coupon sync failed:', e.message);
        }

        // 2. Sync Orders Incremental (Increase limit to get more data)
        const ordersData = await fetchShopify('orders.json?status=any&limit=250&order=created_at%20desc');
        const orders = ordersData.orders || [];

        for (const order of orders) {
            // Re-use the robust attribution logic from attribution.js
            await processOrderWebhook(order, shopifyDomain);
        }

        console.log(`[Sync] Completed sync for ${shopifyDomain}`);
    } catch (err) {
        console.error('[Sync] Global error:', err.message);
    }
}

module.exports = { syncShopifyData };
