const { PrismaClient } = require('./src/generated/client');
try {
    const prisma = new PrismaClient({ log: ['info'] });
    console.log("Prisma init success");
} catch (e) {
    console.error("Prisma init failed:", e);
}
