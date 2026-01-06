const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Backfill productsBought field for all existing customers
 * This script aggregates all products from CSVOrderRecord for each customer
 */
async function backfillProductsBought() {
    console.log('Starting productsBought backfill...');

    try {
        // Get all customers
        const customers = await prisma.customer.findMany({
            select: {
                phone: true,
                name: true
            }
        });

        console.log(`Found ${customers.length} customers to process`);

        let updated = 0;
        let skipped = 0;

        for (const customer of customers) {
            try {
                // Get all order records for this customer
                const orderRecords = await prisma.cSVOrderRecord.findMany({
                    where: {
                        customerPhone: customer.phone
                    },
                    select: {
                        productName: true
                    }
                });

                if (orderRecords.length === 0) {
                    console.log(`  ⚠️  No orders found for ${customer.name} (${customer.phone})`);
                    skipped++;
                    continue;
                }

                // Extract and deduplicate products
                const products = orderRecords
                    .map(o => o.productName)
                    .filter(p => p && p.trim() !== ''); // Remove null/empty

                const uniqueProducts = [...new Set(products)];

                if (uniqueProducts.length === 0) {
                    console.log(`  ⚠️  No valid products for ${customer.name} (${customer.phone})`);
                    skipped++;
                    continue;
                }

                // Update customer with products
                await prisma.customer.update({
                    where: { phone: customer.phone },
                    data: {
                        productsBought: JSON.stringify(uniqueProducts),
                        lastProductOrdered: uniqueProducts[uniqueProducts.length - 1] // Last product
                    }
                });

                console.log(`  ✅ Updated ${customer.name} (${customer.phone}): ${uniqueProducts.length} products`);
                updated++;

            } catch (err) {
                console.error(`  ❌ Error processing ${customer.phone}:`, err.message);
            }
        }

        console.log('\n=== Backfill Complete ===');
        console.log(`✅ Updated: ${updated} customers`);
        console.log(`⚠️  Skipped: ${skipped} customers`);
        console.log(`📊 Total: ${customers.length} customers`);

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the backfill
backfillProductsBought()
    .then(() => {
        console.log('\n✅ Script completed successfully');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n❌ Script failed:', err);
        process.exit(1);
    });
