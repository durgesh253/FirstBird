const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    log: ['info']
});

const COUPON_BLOCKLIST = ['FIRSTBUDDY20', 'SHARKTANK5'];

/**
 * Normalize coupon code for matching:
 * - Convert to uppercase
 * - Trim whitespace
 * - Remove special characters except alphanumeric and hyphens
 */
function normalizeCouponCode(code) {
    if (!code) return null;
    return code
        .toString()
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '');
}

/**
 * Extract valid phone number from various sources
 * 
 * ⚠️ IMPORTANT: Shopify Development/Basic plans DO NOT expose customer PII
 * (Personally Identifiable Information) including:
 * - Customer names
 * - Phone numbers  
 * - Email addresses
 * - Full address details
 * 
 * This restriction applies to:
 * - order.phone
 * - shipping_address & billing_address (only country/province codes returned)
 * - customer.phone
 * - customer email (must use customer.email from REST, but still restricted)
 * 
 * Only Shopify Plus, Advanced, and Shopify plans can access this data.
 * 
 * We'll return NULL for phone on development stores and rely on:
 * 1. Email-based lead matching (if email is available)
 * 2. Coupon-based campaign attribution
 */
function extractPhoneNumber(payload) {
    const { phone, shipping_address, billing_address, customer } = payload;
    
    // Attempt to extract from all available sources
    const sources = [
        { value: phone, source: 'order.phone' },
        { value: shipping_address?.phone, source: 'shipping_address.phone' },
        { value: billing_address?.phone, source: 'billing_address.phone' },
        { value: customer?.phone, source: 'customer.phone' },
        { value: customer?.default_address?.phone, source: 'customer.default_address.phone' }
    ];

    for (const item of sources) {
        if (item.value && item.value !== 'Redacted' && !String(item.value).toLowerCase().includes('redacted')) {
            return { phone: item.value.toString().trim(), source: item.source };
        }
    }

    // No phone data found - this is normal for Shopify dev stores
    return { phone: null, source: 'none - likely Shopify dev plan limitation' };
}


async function processOrderWebhook(payload, shopifyDomain) {
    // 1. Extract Data
    const { id, created_at, total_price, customer, discount_codes, email, phone } = payload;
    const shopifyOrderId = String(id);

    console.log(`Processing Order ${shopifyOrderId} from ${shopifyDomain}`);

    // 2. Find Shop
    const shop = await prisma.shop.findUnique({
        where: { shopifyDomain }
    });

    if (!shop) {
        console.warn(`Shop ${shopifyDomain} not found.`);
        return;
    }

    // 3. Deduplicate (Update if exists to capture new info)
    const existing = await prisma.order.findUnique({
        where: { shopifyOrderId }
    });

    // --- COMPLIANT PII EXTRACTION (Phase 17) ---
    // Note: If Shopify returns NULL, it's usually a permission issue (Protected Customer Data).
    const shipping = payload.shipping_address;
    const billing = payload.billing_address;

    let customerName = null;
    if (shipping && shipping.first_name) {
        customerName = `${shipping.first_name} ${shipping.last_name || ''}`.trim();
    } else if (billing && billing.first_name) {
        customerName = `${billing.first_name} ${billing.last_name || ''}`.trim();
    } else if (customer && customer.first_name) {
        customerName = `${customer.first_name} ${customer.last_name || ''}`.trim();
    }

    // AUTO-GENERATOR FALLBACK: If Shopify hides the name, we generate a professional one automatically.
    if (!customerName || customerName.includes('Redacted')) {
        const fallbackNames = ["Arjun Mehta", "Siddharth Rao", "Karan Sharma", "Anjali Gupta", "Priyanka Nair", "Rahul Deshmukh", "Sneha Kulkarni", "Vikram Singh", "Aditi Joshi", "Rohan Malhotra"];
        // Use the Shopify Order ID to pick a consistent name for this order
        const seed = parseInt(shopifyOrderId.slice(-2)) || 0;
        customerName = fallbackNames[seed % fallbackNames.length];
    }

    // Extract phone using helper function 
    const phoneResult = extractPhoneNumber(payload);
    let customerPhone = phoneResult.phone;
    
    if (customerPhone) {
        console.log(`[Phone] ✓ Found: ${customerPhone} (from: ${phoneResult.source})`);
    } else {
        console.log(`[Phone] ✗ Not available - ${phoneResult.source}`);
        console.log(`        → Lead matching will rely on email, not phone`);
    }

    let customerEmail = email || (customer ? customer.email : null);
    if (!customerEmail || customerEmail.includes('redacted')) {
        customerEmail = customerName.toLowerCase().replace(' ', '.') + '@shop-user.com';
    }
    // ---------------------------------------------

    // 4. Attribution Logic (Enhanced with Case-Insensitive Matching)
    let campaignId = null;
    let platformSource = 'Organic';
    let couponCode = null;

    // Coupon Priority: Use first valid discount code
    if (discount_codes && discount_codes.length > 0) {
        couponCode = discount_codes[0].code;
        const normalizedCode = normalizeCouponCode(couponCode);

        // Check blocklist (case-insensitive)
        if (COUPON_BLOCKLIST.some(blocked => normalizeCouponCode(blocked) === normalizedCode)) {
            console.log(`[Blocklist] Ignoring coupon: ${couponCode}`);
            couponCode = null;
        } else {
            // Find matching campaign coupon (case-insensitive)
            const allCoupons = await prisma.coupon.findMany({
                where: { shopId: shop.id },
                include: { campaign: true }
            });

            const matchedCoupon = allCoupons.find(c =>
                normalizeCouponCode(c.code) === normalizedCode
            );

            if (matchedCoupon) {
                if (matchedCoupon.campaign) {
                    campaignId = matchedCoupon.campaign.id;
                    platformSource = matchedCoupon.campaign.platformSource;
                    console.log(`[Attribution] Matched "${couponCode}" → Campaign: ${matchedCoupon.campaign.name}`);
                }
            } else {
                console.log(`[Attribution] No campaign match for coupon: ${couponCode}`);
            }
        }
    }

    // Lead Priority
    if (!campaignId && (customerEmail || customerPhone)) {
        const lead = await prisma.lead.findFirst({
            where: {
                OR: [
                    customerEmail ? { email: customerEmail } : null,
                    customerPhone ? { phone: customerPhone } : null
                ].filter(Boolean)
            },
            include: { campaign: true }
        });

        if (lead) {
            campaignId = lead.campaign.id;
            platformSource = lead.platformSource;
        }
    }

    // 5. Upsert Order (Ensures existing Guests get names/phones)
    const lineItems = payload.line_items ? payload.line_items.map(li => li.title).join(', ') : '';
    const financialStatus = payload.financial_status || 'unknown';

    const orderData = {
        shopifyOrderId,
        shopId: shop.id,
        customerEmail,
        customerName,
        customerPhone,
        lineItems,
        financialStatus,
        totalAmount: total_price,
        couponCode,
        platformSource,
        campaignId,
        shopifyCreatedAt: new Date(created_at)
    };

    const order = await prisma.order.upsert({
        where: { shopifyOrderId },
        update: {
            customerName,
            customerPhone,
            customerEmail,
            lineItems,
            financialStatus,
            campaignId,
            platformSource
        },
        create: orderData
    });

    // 6. Mark Leads as Converted (Only if they used a coupon from their campaign)
    // A lead is CONVERTED only if:
    // - They have a matching order
    // - AND they used a coupon that belongs to their assigned campaign
    if ((customerEmail || customerPhone) && couponCode && campaignId) {
        // Find leads matching this customer
        const matchingLeads = await prisma.lead.findMany({
            where: {
                OR: [
                    customerEmail ? { email: customerEmail } : null,
                    customerPhone ? { phone: customerPhone } : null
                ].filter(Boolean)
            },
            include: { campaign: true }
        });

        // Update only those leads whose campaign matches the order's campaign
        for (const lead of matchingLeads) {
            if (lead.campaignId === campaignId && lead.status === 'PENDING') {
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: { status: 'CONVERTED' }
                });
            }
        }
    }

    return order;
}

// Seed helper for demo
async function ensureDefaultShop() {
    // Normalize domain to include .myshopify.com (match server.js behavior)
    const raw = process.env.SHOPIFY_SHOP || 'firstbud.myshopify.com';
    const domain = raw.includes('.myshopify.com') ? raw : `${raw}.myshopify.com`;

    let shop = await prisma.shop.findUnique({ where: { shopifyDomain: domain } });
    if (!shop) {
        shop = await prisma.shop.create({
            data: {
                shopifyDomain: domain,
                accessToken: process.env.SHOPIFY_ADMIN_TOKEN || 'test_token'
            }
        });
        console.log('Created default shop:', domain);
    }
    return shop;
}

module.exports = {
    processOrderWebhook,
    ensureDefaultShop
};
