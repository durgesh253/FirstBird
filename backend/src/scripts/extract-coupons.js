const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient({ log: ['info'] });

async function main() {
    console.log('🔍 Extracting coupons from existing orders...');

    // 1. Get all unique coupon codes from Orders
    const ordersWithCoupons = await prisma.order.findMany({
        where: {
            couponCode: { not: null }
        },
        select: {
            couponCode: true,
            shopId: true
        },
        distinct: ['couponCode']
    });

    console.log(`Found ${ordersWithCoupons.length} unique coupons used in orders.`);

    // 2. Ensure default campaign exists
    const shop = await prisma.shop.findFirst();
    if (!shop) {
        console.log('No shop found, skipping.');
        return;
    }

    const defaultCampaign = await prisma.campaign.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'General Promotion',
            platformSource: 'Shopify',
            shopId: shop.id
        }
    });

    // 3. Create Coupon entries if they don't exist
    for (const order of ordersWithCoupons) {
        if (!order.couponCode) continue;

        const existing = await prisma.coupon.findFirst({
            where: {
                code: order.couponCode,
                shopId: order.shopId
            }
        });

        if (!existing) {
            // Create a specific campaign for this coupon to satisfy 1:1 unique constraint
            const campaign = await prisma.campaign.create({
                data: {
                    name: `Campaign for ${order.couponCode}`,
                    platformSource: 'Shopify',
                    shopId: order.shopId
                }
            });

            await prisma.coupon.create({
                data: {
                    code: order.couponCode,
                    shopId: order.shopId,
                    campaignId: campaign.id,
                    status: 'Active'
                }
            });
            console.log(`✅ Created coupon from order history: ${order.couponCode}`);
        } else {
            console.log(`ℹ️ Coupon already exists: ${order.couponCode}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
