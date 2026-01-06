const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const subscriptionService = require('./subscription-service');


/**
 * Normalize phone number for consistent comparison
 * Removes spaces, +91, dashes, and keeps only digits
 */
function normalizePhone(phone) {
    if (!phone) return null;
    // Remove all non-digits
    let normalized = phone.toString().replace(/\D/g, '');
    // Remove leading 91 (India country code) if present and number is > 10 digits
    if (normalized.length > 10 && normalized.startsWith('91')) {
        normalized = normalized.substring(2);
    }
    // Remove leading 0 if present
    if (normalized.startsWith('0')) {
        normalized = normalized.substring(1);
    }
    return normalized || null;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

/**
 * Parse CSV string to array of objects
 * Uses exact Shopify field mappings:
 * - Billing Name → Customer Name
 * - Billing Phone → Customer Phone (Primary Key)
 * - LineItem Name → Product Name
 * - Shipping City → Customer Location
 */
function parseCSV(csvContent) {
    const normalized = csvContent.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
    const lines = normalized.trim().split('\n');
    if (lines.length === 0) throw new Error('Empty CSV file');

    const rawHeaders = parseCSVLine(lines[0]);

    // Create header index map (lowercase, replace spaces with underscores)
    const headerMap = {};
    rawHeaders.forEach((h, idx) => {
        const key = h.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
        headerMap[key] = idx;
    });

    console.log('[CSV Parser] Detected headers:', Object.keys(headerMap));

    // Field mappings using EXACT Shopify export names
    const fieldMappings = {
        // Order ID - use 'Name' column from Shopify (e.g., #1001)
        order_id: ['name', 'order_id', 'orderid', 'order_number', 'id'],

        // Customer Phone - BILLING PHONE is primary
        customer_phone: ['billing_phone', 'phone', 'billing_phone_number', 'customer_phone', 'shipping_phone'],

        // Customer Name - from BILLING NAME
        customer_name: ['billing_name', 'billing_full_name', 'customer_name', 'name', 'customer'],

        // Product Name - from LINEITEM NAME
        product_name: ['lineitem_name', 'line_item_name', 'lineitem', 'product_name', 'product', 'item_name'],

        // Customer City - from SHIPPING CITY
        city: ['shipping_city', 'billing_city', 'city', 'shipping_province_city', 'customer_city'],

        // Order Date
        order_date: ['created_at', 'order_date', 'date', 'paid_at', 'processed_at'],

        // Order Amount
        order_amount: ['total', 'subtotal', 'order_amount', 'amount', 'lineitem_price', 'total_price']
    };

    // Build field index from mappings
    const fieldIndex = {};
    Object.entries(fieldMappings).forEach(([field, aliases]) => {
        for (const alias of aliases) {
            if (headerMap.hasOwnProperty(alias)) {
                fieldIndex[field] = headerMap[alias];
                console.log(`[CSV Parser] Mapped '${field}' → column '${alias}' (index ${headerMap[alias]})`);
                break;
            }
        }
    });

    // Check for required fields (phone is essential)
    if (!('customer_phone' in fieldIndex)) {
        throw new Error('Missing required column: Billing Phone (or Phone). Please ensure your CSV has a phone number column.');
    }
    if (!('order_id' in fieldIndex)) {
        throw new Error('Missing required column: Name (Order ID). Please ensure your CSV has an order identifier column.');
    }

    const records = [];
    const seenOrders = new Set(); // Track unique orders to count correctly

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;

        const values = parseCSVLine(lines[i]);

        // Extract values using field index
        const orderId = fieldIndex.order_id !== undefined ? values[fieldIndex.order_id] : '';
        const phone = fieldIndex.customer_phone !== undefined ? values[fieldIndex.customer_phone] : '';
        const name = fieldIndex.customer_name !== undefined ? values[fieldIndex.customer_name] : '';
        const product = fieldIndex.product_name !== undefined ? values[fieldIndex.product_name] : '';
        const city = fieldIndex.city !== undefined ? values[fieldIndex.city] : '';
        const orderDate = fieldIndex.order_date !== undefined ? values[fieldIndex.order_date] : '';
        const amount = fieldIndex.order_amount !== undefined ? values[fieldIndex.order_amount] : '0';

        const normalizedPhone = normalizePhone(phone);

        if (!normalizedPhone) {
            console.warn(`[CSV Parser] Skipping line ${i + 1}: no valid phone number`);
            continue;
        }

        if (!orderId) {
            console.warn(`[CSV Parser] Skipping line ${i + 1}: no order ID`);
            continue;
        }

        records.push({
            order_id: orderId.trim(),
            customer_phone: normalizedPhone,
            customer_name: name.trim() || 'Unknown',
            product_name: product.trim() || 'Product',
            city: city.trim() || '',
            order_date: orderDate.trim() || new Date().toISOString(),
            order_amount: amount.trim() || '0',
            _isNewOrder: !seenOrders.has(orderId.trim())
        });

        seenOrders.add(orderId.trim());
    }

    if (records.length === 0) {
        throw new Error('No valid records found. Ensure CSV has Billing Phone and Name (Order ID) columns.');
    }

    console.log(`[CSV Parser] Parsed ${records.length} records from ${seenOrders.size} unique orders`);
    return records;
}

/**
 * Process CSV upload with REPEAT CUSTOMER detection
 * - Phone number is unique customer identifier
 * - Tracks customers across ALL uploads
 * - Updates global Customer table
 */
async function processCSVUpload(csvContent, uploadId, shopId = null, compareWithPrevious = false) {
    try {
        // Parse CSV
        const csvRecords = parseCSV(csvContent);

        // Group records by phone number
        const customerData = {};
        const orderGroups = {}; // Group by order ID to count unique orders

        csvRecords.forEach(record => {
            const phone = record.customer_phone;
            const orderId = record.order_id;

            // Track unique orders per customer
            if (!orderGroups[phone]) {
                orderGroups[phone] = new Set();
            }
            orderGroups[phone].add(orderId);

            // Aggregate customer data
            if (!customerData[phone]) {
                customerData[phone] = {
                    phone,
                    name: record.customer_name,
                    cities: new Set(),
                    products: new Set(),
                    orderIds: new Set(),
                    orderDates: [],
                    amounts: []
                };
            }

            const customer = customerData[phone];

            // Always take the latest non-empty name
            if (record.customer_name && record.customer_name !== 'Unknown') {
                customer.name = record.customer_name;
            }

            if (record.city) customer.cities.add(record.city);
            if (record.product_name) customer.products.add(record.product_name);
            customer.orderIds.add(orderId);

            // Parse date
            let orderDate = new Date(record.order_date);
            if (isNaN(orderDate.getTime())) orderDate = new Date();
            customer.orderDates.push(orderDate);

            // Parse amount
            let amount = parseFloat(record.order_amount.replace(/[^0-9.-]/g, ''));
            if (isNaN(amount)) amount = 0;
            customer.amounts.push(amount);
        });

        // Process each customer and update global Customer table
        const processedCustomers = [];

        for (const phone of Object.keys(customerData)) {
            const data = customerData[phone];
            const uniqueOrderCount = orderGroups[phone].size;
            const totalAmount = data.amounts.reduce((a, b) => a + b, 0);
            const minDate = new Date(Math.min(...data.orderDates));
            const maxDate = new Date(Math.max(...data.orderDates));
            const latestProduct = Array.from(data.products).pop() || '';
            const primaryCity = Array.from(data.cities)[0] || null;

            // Check if customer exists in global table
            let existingCustomer = await prisma.customer.findUnique({
                where: { phone }
            });

            let customer;
            let wasRepeat = false;

            if (existingCustomer) {
                // Customer exists - update their record
                wasRepeat = true;
                const existingProducts = JSON.parse(existingCustomer.productsBought || '[]');
                const existingCities = JSON.parse(existingCustomer.allCities || '[]');

                const allProducts = [...new Set([...existingProducts, ...Array.from(data.products)])];
                const allCities = [...new Set([...existingCities, ...Array.from(data.cities)])];

                customer = await prisma.customer.update({
                    where: { phone },
                    data: {
                        name: data.name || existingCustomer.name,
                        city: primaryCity || existingCustomer.city,
                        totalOrders: existingCustomer.totalOrders + uniqueOrderCount,
                        isRepeatCustomer: true, // Now a repeat customer
                        lastProductOrdered: latestProduct || existingCustomer.lastProductOrdered,
                        lastOrderDate: maxDate > (existingCustomer.lastOrderDate || new Date(0)) ? maxDate : existingCustomer.lastOrderDate,
                        totalSpent: parseFloat(existingCustomer.totalSpent) + totalAmount,
                        productsBought: JSON.stringify(allProducts),
                        allCities: JSON.stringify(allCities)
                    }
                });
            } else {
                // New customer
                customer = await prisma.customer.create({
                    data: {
                        phone,
                        name: data.name || 'Unknown',
                        city: primaryCity,
                        totalOrders: uniqueOrderCount,
                        isRepeatCustomer: uniqueOrderCount > 1, // Repeat if multiple orders in same upload
                        lastProductOrdered: latestProduct,
                        lastOrderDate: maxDate,
                        firstOrderDate: minDate,
                        totalSpent: totalAmount,
                        productsBought: JSON.stringify(Array.from(data.products)),
                        allCities: JSON.stringify(Array.from(data.cities))
                    }
                });
            }

            processedCustomers.push({
                ...customer,
                wasRepeat,
                newOrdersInUpload: uniqueOrderCount
            });

            // Create per-upload analysis record
            try {
                await prisma.customerAnalysis.create({
                    data: {
                        uploadId,
                        customerPhone: phone,
                        customerName: data.name,
                        location: primaryCity,
                        totalOrders: uniqueOrderCount,
                        customerType: customer.isRepeatCustomer ? 'Repeat' : 'New',
                        productsBought: JSON.stringify(Array.from(data.products)),
                        orderIds: JSON.stringify(Array.from(data.orderIds)),
                        locations: JSON.stringify(Array.from(data.cities)),
                        firstOrderDate: minDate,
                        lastOrderDate: maxDate,
                        totalSpent: totalAmount
                    }
                });
            } catch (e) {
                if (e.code === 'P2002') {
                    // Duplicate - update instead
                    await prisma.customerAnalysis.update({
                        where: { uploadId_customerPhone: { uploadId, customerPhone: phone } },
                        data: {
                            customerName: data.name,
                            location: primaryCity,
                            totalOrders: uniqueOrderCount,
                            customerType: customer.isRepeatCustomer ? 'Repeat' : 'New',
                            productsBought: JSON.stringify(Array.from(data.products)),
                            orderIds: JSON.stringify(Array.from(data.orderIds)),
                            locations: JSON.stringify(Array.from(data.cities)),
                            lastOrderDate: maxDate,
                            totalSpent: totalAmount
                        }
                    });
                }
            }
        }

        // Store individual order records
        for (const record of csvRecords) {
            const customer = await prisma.customer.findUnique({
                where: { phone: record.customer_phone }
            });

            let orderDate = new Date(record.order_date);
            if (isNaN(orderDate.getTime())) orderDate = new Date();

            let orderAmount = parseFloat(record.order_amount.replace(/[^0-9.-]/g, ''));
            if (isNaN(orderAmount)) orderAmount = 0;

            try {
                await prisma.cSVOrderRecord.create({
                    data: {
                        uploadId,
                        orderId: record.order_id,
                        customerPhone: record.customer_phone,
                        customerId: customer?.id || null,
                        customerName: record.customer_name,
                        productName: record.product_name,
                        city: record.city || null,
                        orderDate,
                        orderAmount,
                        rawData: JSON.stringify(record)
                    }
                });
            } catch (e) {
                // Skip duplicates
                if (e.code !== 'P2002') {
                    console.error('[CSV] Error saving order record:', e.message);
                }
            }

            // AUTO-CREATE SUBSCRIPTION and link customer
            // This is where the magic happens - every product purchase creates/updates subscription
            try {
                await subscriptionService.linkCustomerToSubscription(
                    record.customer_phone,
                    record.product_name,
                    orderAmount,
                    orderDate
                );
            } catch (subErr) {
                console.error('[Subscription] Error linking:', subErr.message);
            }
        }

        // Update upload status
        await prisma.cSVUpload.update({
            where: { id: uploadId },
            data: {
                status: 'SUCCESS',
                processedAt: new Date(),
                totalRows: csvRecords.length
            }
        });

        const newCustomers = processedCustomers.filter(c => !c.wasRepeat).length;
        const repeatCustomers = processedCustomers.filter(c => c.wasRepeat).length;

        console.log(`[CSV] Upload ${uploadId} complete: ${newCustomers} new, ${repeatCustomers} repeat customers`);

        return {
            success: true,
            uploadId,
            totalCustomers: processedCustomers.length,
            newCustomers,
            repeatCustomers,
            totalOrders: new Set(csvRecords.map(r => r.order_id)).size
        };
    } catch (error) {
        console.error('[CSV] Processing error:', error);

        await prisma.cSVUpload.update({
            where: { id: uploadId },
            data: {
                status: 'FAILED',
                errorMessage: error.message,
                processedAt: new Date()
            }
        });

        throw error;
    }
}

/**
 * Get all customers from global Customer table with filters
 */
async function getCustomers(filters = {}) {
    const {
        isRepeatOnly = false,
        searchPhone = null,
        searchName = null,
        searchCity = null,
        sortBy = 'totalOrders',
        sortOrder = 'desc',
        limit = 100
    } = filters;

    let where = {};

    // Only add isRepeatCustomer filter if specifically set to true
    if (isRepeatOnly === true) {
        where.isRepeatCustomer = true;
    }

    if (searchPhone) {
        where.phone = { contains: normalizePhone(searchPhone) || searchPhone };
    }

    if (searchName) {
        where.name = { contains: searchName };
    }

    if (searchCity) {
        where.city = { contains: searchCity };
    }

    const orderByField = sortBy === 'total_orders' ? 'totalOrders' :
        sortBy === 'total_spent' ? 'totalSpent' :
            sortBy === 'last_order_date' ? 'lastOrderDate' : sortBy;

    console.log('[getCustomers] Query where:', JSON.stringify(where), 'isRepeatOnly:', isRepeatOnly);

    const customers = await prisma.customer.findMany({
        where,
        orderBy: { [orderByField]: sortOrder },
        take: limit
    });

    console.log('[getCustomers] Found', customers.length, 'customers');

    // Aggregate products from order records for each customer
    const customersWithProducts = await Promise.all(customers.map(async (c) => {
        let productsBought = [];

        try {
            // Query ALL order records for this customer
            const orderRecords = await prisma.cSVOrderRecord.findMany({
                where: {
                    customerPhone: c.phone
                },
                select: {
                    productName: true
                }
            });

            if (orderRecords && orderRecords.length > 0) {
                // Extract, filter, and deduplicate products
                const products = orderRecords
                    .map(o => o.productName)
                    .filter(p => p && p.trim() !== '');

                productsBought = [...new Set(products)];
            }
        } catch (e) {
            console.error(`[getCustomers] Error fetching products for ${c.phone}:`, e);
        }

        return {
            ...c,
            totalSpent: parseFloat(c.totalSpent || 0),
            productsBought: productsBought, // Array of unique products
            allCities: JSON.parse(c.allCities || '[]')
        };
    }));

    return customersWithProducts;
}

/**
 * Get customer detail by phone with full order history
 */
async function getCustomerByPhone(phone) {
    const normalizedPhone = normalizePhone(phone) || phone;

    const customer = await prisma.customer.findUnique({
        where: { phone: normalizedPhone }
    });

    if (!customer) {
        return null;
    }

    // Get all orders for this customer
    const orders = await prisma.cSVOrderRecord.findMany({
        where: { customerPhone: normalizedPhone },
        orderBy: { orderDate: 'desc' }
    });

    return {
        ...customer,
        totalSpent: parseFloat(customer.totalSpent || 0),
        productsBought: JSON.parse(customer.productsBought || '[]'),
        allCities: JSON.parse(customer.allCities || '[]'),
        orders: orders.map(o => ({
            orderId: o.orderId,
            productName: o.productName,
            city: o.city,
            orderDate: o.orderDate,
            orderAmount: parseFloat(o.orderAmount || 0)
        }))
    };
}

/**
 * Get customer analysis for a specific upload (for backwards compatibility)
 */
async function getCustomerAnalysis(uploadId, filters = {}) {
    const {
        customerType = null,
        searchPhone = null,
        searchProduct = null,
        sortBy = 'total_orders',
        sortOrder = 'desc'
    } = filters;

    let where = { uploadId };

    if (customerType) {
        where.customerType = customerType;
    }

    if (searchPhone) {
        where.customerPhone = { contains: normalizePhone(searchPhone) || searchPhone };
    }

    let customers = await prisma.customerAnalysis.findMany({ where });

    // Get global customer data for each
    const enrichedCustomers = await Promise.all(customers.map(async (c) => {
        const globalCustomer = await prisma.customer.findUnique({
            where: { phone: c.customerPhone }
        });

        return {
            ...c,
            productsBought: JSON.parse(c.productsBought || '[]'),
            orderIds: JSON.parse(c.orderIds || '[]'),
            locations: JSON.parse(c.locations || '[]'),
            // Add global stats
            globalTotalOrders: globalCustomer?.totalOrders || c.totalOrders,
            isRepeatCustomer: globalCustomer?.isRepeatCustomer || false,
            globalTotalSpent: parseFloat(globalCustomer?.totalSpent || c.totalSpent)
        };
    }));

    // Filter by product if needed
    let result = enrichedCustomers;
    if (searchProduct) {
        const searchLower = searchProduct.toLowerCase();
        result = result.filter(c =>
            c.productsBought.some(p => p.toLowerCase().includes(searchLower))
        );
    }

    // Sort
    const sortFieldMap = {
        'total_orders': 'globalTotalOrders',
        'total_spent': 'globalTotalSpent',
        'last_order_date': 'lastOrderDate'
    };

    const sortField = sortFieldMap[sortBy] || 'globalTotalOrders';
    result.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
    });

    return result;
}

/**
 * Get customer detail with order history (per-upload)
 */
async function getCustomerDetail(uploadId, customerPhone) {
    const normalizedPhone = normalizePhone(customerPhone) || customerPhone;

    // Get per-upload analysis
    const analysis = await prisma.customerAnalysis.findUnique({
        where: {
            uploadId_customerPhone: { uploadId, customerPhone: normalizedPhone }
        }
    });

    // Get global customer data
    const globalCustomer = await prisma.customer.findUnique({
        where: { phone: normalizedPhone }
    });

    if (!analysis && !globalCustomer) {
        throw new Error('Customer not found');
    }

    // Get orders for this upload
    const orders = await prisma.cSVOrderRecord.findMany({
        where: {
            uploadId,
            customerPhone: normalizedPhone
        },
        orderBy: { orderDate: 'desc' }
    });

    return {
        customerPhone: normalizedPhone,
        customerName: globalCustomer?.name || analysis?.customerName || 'Unknown',
        city: globalCustomer?.city || analysis?.location || null,
        totalOrders: globalCustomer?.totalOrders || analysis?.totalOrders || 0,
        isRepeatCustomer: globalCustomer?.isRepeatCustomer || false,
        customerType: globalCustomer?.isRepeatCustomer ? 'Repeat' : 'New',
        totalSpent: parseFloat(globalCustomer?.totalSpent || analysis?.totalSpent || 0),
        lastProductOrdered: globalCustomer?.lastProductOrdered || null,
        lastOrderDate: globalCustomer?.lastOrderDate || analysis?.lastOrderDate,
        firstOrderDate: globalCustomer?.firstOrderDate || analysis?.firstOrderDate,
        productsBought: JSON.parse(globalCustomer?.productsBought || analysis?.productsBought || '[]'),
        allCities: JSON.parse(globalCustomer?.allCities || '[]'),
        orders: orders.map(o => ({
            orderId: o.orderId,
            productName: o.productName,
            city: o.city,
            orderDate: o.orderDate,
            orderAmount: parseFloat(o.orderAmount || 0)
        }))
    };
}

/**
 * Get upload statistics
 */
async function getUploadStats(uploadId) {
    const customers = await prisma.customerAnalysis.findMany({
        where: { uploadId }
    });

    // Get global repeat status for each
    let newCount = 0;
    let repeatCount = 0;
    let totalOrders = 0;
    let totalRevenue = 0;

    for (const c of customers) {
        const globalCustomer = await prisma.customer.findUnique({
            where: { phone: c.customerPhone }
        });

        if (globalCustomer?.isRepeatCustomer) {
            repeatCount++;
        } else {
            newCount++;
        }

        totalOrders += c.totalOrders;
        totalRevenue += parseFloat(c.totalSpent || 0);
    }

    return {
        totalCustomers: customers.length,
        newCustomers: newCount,
        repeatCustomers: repeatCount,
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2))
    };
}

/**
 * Get global customer statistics
 */
async function getGlobalStats() {
    const totalCustomers = await prisma.customer.count();
    const repeatCustomers = await prisma.customer.count({
        where: { isRepeatCustomer: true }
    });
    const newCustomers = totalCustomers - repeatCustomers;

    const aggregates = await prisma.customer.aggregate({
        _sum: { totalOrders: true, totalSpent: true }
    });

    return {
        totalCustomers,
        newCustomers,
        repeatCustomers,
        totalOrders: aggregates._sum.totalOrders || 0,
        totalRevenue: parseFloat(aggregates._sum.totalSpent || 0)
    };
}

module.exports = {
    normalizePhone,
    parseCSV,
    processCSVUpload,
    getCustomers,
    getCustomerByPhone,
    getCustomerAnalysis,
    getCustomerDetail,
    getUploadStats,
    getGlobalStats
};
