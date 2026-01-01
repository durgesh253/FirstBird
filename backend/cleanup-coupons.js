const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function cleanup() {
    const codes = ['FIRSTBUDDY20', 'SHARKTANK5'];

    console.log(`🚀 Starting cleanup for: ${codes.join(', ')}`);

    // 1. Remove from Coupon table if they exist
    const deletedCoupons = await prisma.coupon.deleteMany({
        where: { code: { in: codes } }
    });
    console.log(`✅ Deleted ${deletedCoupons.count} records from Coupon table.`);

    // 2. Nullify in Order table
    const updatedOrders = await prisma.order.updateMany({
        where: { couponCode: { in: codes } },
        data: {
            couponCode: null,
            campaignId: null // Disassociate from campaigns as well
        }
    });
    console.log(`✅ Updated ${updatedOrders.count} orders to remove coupon association.`);

    process.exit(0);
}

cleanup();
