const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    console.log('📊 Checking the last 5 orders in your database...');
    try {
        const orders = await prisma.order.findMany({
            take: 5,
            orderBy: { shopifyCreatedAt: 'desc' },
            select: {
                shopifyOrderId: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                totalAmount: true
            }
        });

        if (orders.length === 0) {
            console.log('❌ No orders found in database.');
        } else {
            console.table(orders);
        }
    } catch (err) {
        console.error('❌ Database error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
