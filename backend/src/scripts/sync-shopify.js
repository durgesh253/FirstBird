const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['info'] });

// Credentials provided by user
const SHOP = 'firstbud';
const ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || 'your_token_here';
const API_VERSION = '2025-01'; // '2025-10' likely typo/future, using Jan 2025 or current stable
const BASE_URL = `https://${SHOP}.myshopify.com/admin/api/${API_VERSION}`;

async function fetchShopify(endpoint) {
    const url = `${BASE_URL}/${endpoint}`;
    console.log(`Fetching ${url}...`);
    const response = await fetch(url, {
        headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Shopify API Error: ${response.status} ${response.statusText} - ${await response.text()}`);
    }
    return await response.json();
}

async function main() {
    console.log('🔄 Starting Shopify Sync...');

    try {
        // 0. Ensure schema is updated (manual column add for dev)
        try {
            await prisma.$executeRawUnsafe('ALTER TABLE "Order" ADD COLUMN "financialStatus" TEXT');
            console.log('✅ Added financialStatus column to Order table.');
        } catch (colErr) {
            // Likely already exists
        }

        // 1. Ensure Shop exists
        const shop = await prisma.shop.upsert({
            where: { shopifyDomain: `${SHOP}.myshopify.com` },
            update: { accessToken: ACCESS_TOKEN },
            create: {
                shopifyDomain: `${SHOP}.myshopify.com`,
                accessToken: ACCESS_TOKEN
            }
        });

        const { processOrderWebhook } = require('../services/attribution');

        // 1. Sync Coupons (Price Rules --> Discount Codes)
        console.log('🎫 Syncing Coupons...');
        try {
            const rulesData = await fetchShopify('price_rules.json');
            const priceRules = rulesData.price_rules || [];

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
                try {
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
                            update: { status: 'ACTIVE' },
                            create: {
                                code: dCode.code,
                                shopId: shop.id,
                                campaignId: defaultCampaign.id,
                                status: 'ACTIVE'
                            }
                        });
                        console.log(`   -> Synced Coupon: ${dCode.code}`);
                    }
                } catch (e) {
                    console.warn(`   ⚠️ Could not fetch codes for rule ${rule.title}: ${e.message}`);
                }
            }
        } catch (couponError) {
            console.error('⚠️ Failed to sync coupons:', couponError.message);
        }

        // 2. Sync Orders (Non-Destructive)
        console.log('📦 Syncing Orders...');
        const ordersData = await fetchShopify('orders.json?status=any&limit=250');
        const orders = ordersData.orders || [];

        for (const order of orders) {
            // Use the robust attribution logic (also handles upserting)
            await processOrderWebhook(order, `${SHOP}.myshopify.com`);
            console.log(`   -> Synced Order: #${order.order_number}`);
        }

        console.log('✅ Sync Complete!');

    } catch (err) {
        console.error('❌ Sync Failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
