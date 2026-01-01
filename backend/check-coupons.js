const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function check() {
    const codes = ['FIRSTBUDDY20', 'SHARKTANK5'];

    console.log('--- Coupons ---');
    const coupons = await prisma.coupon.findMany({
        where: { code: { in: codes } }
    });
    console.log(JSON.stringify(coupons, null, 2));

    console.log('--- Orders with these codes ---');
    const orders = await prisma.order.findMany({
        where: { couponCode: { in: codes } },
        select: { id: true, shopifyOrderId: true, couponCode: true }
    });
    console.log(`Found ${orders.length} orders.`);

    process.exit(0);
}

check();
