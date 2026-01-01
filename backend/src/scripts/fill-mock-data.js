const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const INDIAN_NAMES = [
    "Arjun Mehta", "Siddharth Rao", "Karan Sharma", "Anjali Gupta",
    "Priyanka Nair", "Rahul Deshmukh", "Sneha Kulkarni", "Vikram Singh",
    "Aditi Joshi", "Rohan Malhotra", "Ishaan Kapoor", "Tanvi Shah",
    "Aavya Varma", "Kabir Saxena", "Myra Reddy", "Advait Pandey"
];

const DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com"];

function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone() {
    return "+91 " + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
}

async function fillMockData() {
    console.log('🎨 Starting Professional Mock Data injection...');

    try {
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { customerName: 'Guest (Redacted)' },
                    { customerName: 'Guest' },
                    { customerName: null }
                ]
            }
        });

        console.log(`📝 Found ${orders.length} orders to update.`);

        for (const order of orders) {
            const name = getRandom(INDIAN_NAMES);
            const email = name.toLowerCase().replace(' ', '.') + '@' + getRandom(DOMAINS);
            const phone = generatePhone();

            await prisma.order.update({
                where: { id: order.id },
                data: {
                    customerName: name,
                    customerEmail: email,
                    customerPhone: phone
                }
            });
        }

        console.log('\n✅ Mission Accomplished!');
        console.log(`Successfully filled ${orders.length} orders with professional mock names.`);
        console.log('Your dashboard and Prisma Studio will now look full and beautiful! ✨');

    } catch (err) {
        console.error('❌ Mock failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

fillMockData();
