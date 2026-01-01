const { PrismaClient } = require('../generated/client');
const prisma = new PrismaClient({ log: ['info'] });

async function main() {
    console.log('🌱 Starting seed...');

    // 0. Clean up
    await prisma.order.deleteMany();
    await prisma.lead.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.shop.deleteMany();

    // 1. Create Shop
    const shop = await prisma.shop.create({
        data: {
            shopifyDomain: 'firstbud.myshopify.com',
            accessToken: 'shpat_mock_token'
        }
    });
    console.log(`✅ Shop: ${shop.shopifyDomain}`);

    // 2. Create Campaigns
    // We need to carefully link coupons 1:1
    const campaignsData = [
        { name: 'Summer Sale 2024', platformSource: 'Instagram', status: 'Active' },
        { name: 'WhatsApp Blast', platformSource: 'WhatsApp', status: 'Active' },
        { name: 'Email Welcome', platformSource: 'Email', status: 'Active' },
        { name: 'Influencer Collab', platformSource: 'Instagram', status: 'Completed' },
        { name: 'Flash Sale', platformSource: 'Website', status: 'Active' }, // added for FLASH50
        { name: 'Retention', platformSource: 'Email', status: 'Active' },    // added for FREESHIP
        { name: 'Yogreet Promo', platformSource: 'WhatsApp', status: 'Active' } // added for YOGREET10
    ];

    const campaigns = [];
    for (const c of campaignsData) {
        const cam = await prisma.campaign.create({
            data: {
                name: c.name,
                platformSource: c.platformSource,
                shopId: shop.id
            }
        });
        campaigns.push(cam);
    }
    console.log(`✅ Created ${campaigns.length} campaigns`);

    // 3. Create Coupons linked to Campaigns (1:1)
    // Maps to campaigns array indices
    const couponsData = [
        { code: 'SUMMER10', campaignIdx: 0 },
        { code: 'WASHOP', campaignIdx: 1 },
        { code: 'WELCOME20', campaignIdx: 2 },
        { code: 'JANE20', campaignIdx: 3 },
        { code: 'FLASH50', campaignIdx: 4 },
        { code: 'FREESHIP', campaignIdx: 5 },
        { code: 'YOGREET10', campaignIdx: 6 } // added by patch
    ];

    for (const c of couponsData) {
        await prisma.coupon.create({
            data: {
                code: c.code,
                shopId: shop.id,
                campaignId: campaigns[c.campaignIdx].id
            }
        });
    }
    console.log(`✅ Created ${couponsData.length} coupons`);

    // 4. Create Leads (Mock)
    const leadsData = [
        { email: 'sarah@example.com', campaignIdx: 0, platform: 'Instagram' },
        { email: 'john@example.com', campaignIdx: 2, platform: 'Email' },
        { email: 'mike@example.com', campaignIdx: 1, platform: 'WhatsApp' }
    ];

    for (const l of leadsData) {
        await prisma.lead.create({
            data: {
                email: l.email,
                campaignId: campaigns[l.campaignIdx].id,
                platformSource: l.platform
            }
        });
    }
    console.log(`✅ Created ${leadsData.length} leads`);

    // 5. Create Orders (Attributed) - spread throughout December
    const ordersData = [
        { id: '10234', total: 120.00, email: 'sarah@example.com', coupon: 'SUMMER10', campaignIdx: 0, platform: 'Instagram', day: 1 },
        { id: '10233', total: 45.00, email: 'kyle@example.com', coupon: 'WELCOME20', campaignIdx: 2, platform: 'Email', day: 5 },
        { id: '10231', total: 85.50, email: 'jane@example.com', coupon: 'WASHOP', campaignIdx: 1, platform: 'WhatsApp', day: 8 },
        { id: '10230', total: 320.00, email: 'ellen@example.com', coupon: 'JANE20', campaignIdx: 3, platform: 'Instagram', day: 12 },
        { id: '10229', total: 250.00, email: 'doe@example.com', coupon: null, campaignIdx: null, platform: 'Organic', day: 15 },
        { id: '10228', total: 50.00, email: 'flash@example.com', coupon: 'FLASH50', campaignIdx: 4, platform: 'Website', day: 18 },
        { id: '10227', total: 99.00, email: 'yogreet@example.com', coupon: 'YOGREET10', campaignIdx: 6, platform: 'WhatsApp', day: 22 },
        { id: '10226', total: 175.00, email: 'alex@example.com', coupon: 'SUMMER10', campaignIdx: 0, platform: 'Instagram', day: 25 },
        { id: '10225', total: 210.00, email: 'priya@example.com', coupon: 'WASHOP', campaignIdx: 1, platform: 'WhatsApp', day: 28 },
        { id: '10224', total: 95.00, email: 'arjun@example.com', coupon: 'YOGREET10', campaignIdx: 6, platform: 'WhatsApp', day: 29 },
        { id: '10223', total: 160.00, email: 'deepak@example.com', coupon: 'WELCOME20', campaignIdx: 2, platform: 'Email', day: 30 },
        { id: '10222', total: 285.00, email: 'neha@example.com', coupon: 'FLASH50', campaignIdx: 4, platform: 'Website', day: 31 }
    ];

    for (const o of ordersData) {
        // Create date for specific day in December 2025
        const orderDate = new Date(2025, 11, o.day, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        await prisma.order.create({
            data: {
                shopifyOrderId: o.id,
                shopId: shop.id,
                customerEmail: o.email,
                totalAmount: o.total,
                couponCode: o.coupon,
                platformSource: o.platform,
                campaignId: o.campaignIdx !== null ? campaigns[o.campaignIdx].id : null,
                financialStatus: 'paid',  // Required for coupon filtering in API
                shopifyCreatedAt: orderDate
            }
        });
    }
    console.log(`✅ Created ${ordersData.length} orders`);

    console.log('🌱 Seed completed!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
