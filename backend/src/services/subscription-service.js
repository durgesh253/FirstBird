const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * SUBSCRIPTION SERVICE
 * Handles automatic subscription creation from products
 * No manual subscription creation - everything is auto-generated
 */

/**
 * Get or create a subscription for a product
 * This is the core function - automatically creates subscriptions from products
 */
async function getOrCreateSubscription(productName, price, currency = 'INR') {
    if (!productName || productName.trim() === '') {
        return null;
    }

    const normalizedName = productName.trim();
    const lowerName = normalizedName.toLowerCase();

    // Try to find existing subscription (case-insensitive)
    let subscription = await prisma.subscription.findUnique({
        where: { productNameLower: lowerName }
    });

    if (subscription) {
        // Update price if it changed (keep in sync with product)
        if (price && parseFloat(subscription.price) !== parseFloat(price)) {
            subscription = await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    price: parseFloat(price),
                    currency,
                    updatedAt: new Date()
                }
            });
            console.log(`[Subscription] Updated price for "${normalizedName}": ₹${price}`);
        }
        return subscription;
    }

    // Create new subscription automatically
    const newPrice = parseFloat(price) || 0;
    subscription = await prisma.subscription.create({
        data: {
            productName: normalizedName,
            productNameLower: lowerName,
            price: newPrice,
            currency,
            billingInterval: 'monthly',
            isActive: true,
            totalSubscribers: 0,
            totalRevenue: 0
        }
    });

    console.log(`[Subscription] Auto-created subscription for "${normalizedName}" at ₹${newPrice}`);
    return subscription;
}

/**
 * Link a customer to a subscription (when they purchase a product)
 * Handles repeat purchases - extends existing subscription instead of creating new
 */
async function linkCustomerToSubscription(customerPhone, productName, price, orderDate = null) {
    if (!customerPhone || !productName) {
        return null;
    }

    // First, get or create the subscription for this product
    const subscription = await getOrCreateSubscription(productName, price);
    if (!subscription) {
        return null;
    }

    const purchaseDate = orderDate ? new Date(orderDate) : new Date();
    const nextBillingDate = new Date(purchaseDate);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1); // Monthly billing

    // Check if customer already has this subscription
    let customerSub = await prisma.customerSubscription.findUnique({
        where: {
            customerPhone_subscriptionId: {
                customerPhone,
                subscriptionId: subscription.id
            }
        }
    });

    if (customerSub) {
        // Customer already subscribed - this is a renewal/repeat purchase
        customerSub = await prisma.customerSubscription.update({
            where: { id: customerSub.id },
            data: {
                status: 'active',
                lastBillingDate: purchaseDate,
                nextBillingDate,
                totalOrdersOnPlan: customerSub.totalOrdersOnPlan + 1,
                totalSpentOnPlan: parseFloat(customerSub.totalSpentOnPlan) + parseFloat(price || 0),
                price: parseFloat(price) || customerSub.price, // Update to latest price
                updatedAt: new Date()
            }
        });

        console.log(`[Subscription] Renewed "${productName}" for ${customerPhone} (Order #${customerSub.totalOrdersOnPlan})`);
    } else {
        // New subscription for this customer
        customerSub = await prisma.customerSubscription.create({
            data: {
                customerPhone,
                subscriptionId: subscription.id,
                productName: productName.trim(),
                price: parseFloat(price) || 0,
                status: 'active',
                startDate: purchaseDate,
                nextBillingDate,
                lastBillingDate: purchaseDate,
                totalOrdersOnPlan: 1,
                totalSpentOnPlan: parseFloat(price) || 0
            }
        });

        // Increment subscriber count
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                totalSubscribers: subscription.totalSubscribers + 1,
                totalRevenue: parseFloat(subscription.totalRevenue) + parseFloat(price || 0)
            }
        });

        console.log(`[Subscription] New subscriber for "${productName}": ${customerPhone}`);
    }

    return customerSub;
}

/**
 * Process all products from an order and create/link subscriptions
 */
async function processOrderSubscriptions(customerPhone, products) {
    if (!customerPhone || !products || products.length === 0) {
        return [];
    }

    const results = [];
    for (const product of products) {
        const result = await linkCustomerToSubscription(
            customerPhone,
            product.name,
            product.price,
            product.orderDate
        );
        if (result) {
            results.push(result);
        }
    }

    return results;
}

/**
 * Get all subscriptions (product list with subscription data)
 */
async function getAllSubscriptions(filters = {}) {
    const {
        isActive = null,
        searchProduct = null,
        sortBy = 'totalSubscribers',
        sortOrder = 'desc',
        limit = 100
    } = filters;

    let where = {};

    if (isActive !== null) {
        where.isActive = isActive;
    }

    if (searchProduct) {
        where.productName = { contains: searchProduct };
    }

    const subscriptions = await prisma.subscription.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        include: {
            _count: { select: { customerSubscriptions: true } }
        }
    });

    return subscriptions.map(s => ({
        ...s,
        price: parseFloat(s.price || 0),
        totalRevenue: parseFloat(s.totalRevenue || 0),
        activeSubscribers: s._count.customerSubscriptions
    }));
}

/**
 * Get subscription by product name
 */
async function getSubscriptionByProduct(productName) {
    const lowerName = productName.toLowerCase().trim();

    const subscription = await prisma.subscription.findUnique({
        where: { productNameLower: lowerName },
        include: {
            customerSubscriptions: {
                orderBy: { startDate: 'desc' },
                take: 20
            }
        }
    });

    if (!subscription) {
        return null;
    }

    return {
        ...subscription,
        price: parseFloat(subscription.price || 0),
        totalRevenue: parseFloat(subscription.totalRevenue || 0)
    };
}

/**
 * Get all subscriptions for a customer
 */
async function getCustomerSubscriptions(customerPhone, includeInactive = false) {
    let where = { customerPhone };

    if (!includeInactive) {
        where.status = 'active';
    }

    const subscriptions = await prisma.customerSubscription.findMany({
        where,
        orderBy: { startDate: 'desc' },
        include: {
            subscription: true
        }
    });

    return subscriptions.map(s => ({
        ...s,
        price: parseFloat(s.price || 0),
        totalSpentOnPlan: parseFloat(s.totalSpentOnPlan || 0),
        subscriptionDetails: {
            ...s.subscription,
            price: parseFloat(s.subscription.price || 0)
        }
    }));
}

/**
 * Get subscription statistics
 */
async function getSubscriptionStats() {
    const totalSubscriptions = await prisma.subscription.count();
    const activeSubscriptions = await prisma.subscription.count({
        where: { isActive: true }
    });

    const totalCustomerSubscriptions = await prisma.customerSubscription.count();
    const activeCustomerSubscriptions = await prisma.customerSubscription.count({
        where: { status: 'active' }
    });

    const revenueAggregate = await prisma.subscription.aggregate({
        _sum: { totalRevenue: true }
    });

    const subscriberAggregate = await prisma.subscription.aggregate({
        _sum: { totalSubscribers: true }
    });

    // Get top products by subscribers
    const topProducts = await prisma.subscription.findMany({
        where: { isActive: true },
        orderBy: { totalSubscribers: 'desc' },
        take: 5
    });

    return {
        totalProducts: totalSubscriptions,
        activeProducts: activeSubscriptions,
        totalSubscribers: subscriberAggregate._sum.totalSubscribers || 0,
        activeSubscribers: activeCustomerSubscriptions,
        totalRevenue: parseFloat(revenueAggregate._sum.totalRevenue || 0),
        topProducts: topProducts.map(p => ({
            productName: p.productName,
            subscribers: p.totalSubscribers,
            price: parseFloat(p.price || 0),
            revenue: parseFloat(p.totalRevenue || 0)
        }))
    };
}

/**
 * Cancel a customer's subscription
 */
async function cancelSubscription(customerPhone, subscriptionId) {
    const customerSub = await prisma.customerSubscription.findUnique({
        where: {
            customerPhone_subscriptionId: {
                customerPhone,
                subscriptionId
            }
        }
    });

    if (!customerSub) {
        throw new Error('Subscription not found');
    }

    await prisma.customerSubscription.update({
        where: { id: customerSub.id },
        data: {
            status: 'cancelled',
            cancelledAt: new Date()
        }
    });

    // Decrement subscriber count
    await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
            totalSubscribers: { decrement: 1 }
        }
    });

    return { success: true, message: 'Subscription cancelled' };
}

/**
 * Sync subscriptions from existing order data
 * Run this to backfill subscriptions from historical orders
 */
async function syncSubscriptionsFromOrders() {
    console.log('[Subscription] Syncing subscriptions from order records...');

    const orderRecords = await prisma.cSVOrderRecord.findMany({
        orderBy: { orderDate: 'asc' }
    });

    let created = 0;
    let updated = 0;

    for (const order of orderRecords) {
        if (!order.customerPhone || !order.productName) continue;

        const result = await linkCustomerToSubscription(
            order.customerPhone,
            order.productName,
            parseFloat(order.orderAmount || 0),
            order.orderDate
        );

        if (result) {
            if (result.totalOrdersOnPlan === 1) {
                created++;
            } else {
                updated++;
            }
        }
    }

    console.log(`[Subscription] Sync complete: ${created} new, ${updated} renewed`);
    return { created, updated };
}

module.exports = {
    getOrCreateSubscription,
    linkCustomerToSubscription,
    processOrderSubscriptions,
    getAllSubscriptions,
    getSubscriptionByProduct,
    getCustomerSubscriptions,
    getSubscriptionStats,
    cancelSubscription,
    syncSubscriptionsFromOrders
};
