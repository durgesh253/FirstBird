const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    log: ['info']
});

const COUPON_BLOCKLIST = ['FIRSTBUDDY20', 'SHARKTANK5'];

// Get available months labels (Combined: Shopify + CSV)
router.get('/orders/months', async (req, res) => {
    try {
        const [shopifyOrders, csvOrders] = await Promise.all([
            prisma.order.findMany({ select: { shopifyCreatedAt: true } }),
            prisma.cSVOrderRecord.findMany({ select: { orderDate: true } })
        ]);

        const months = new Set();

        shopifyOrders.forEach(o => {
            const d = new Date(o.shopifyCreatedAt);
            const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
            const value = `${d.getFullYear()}-${d.getMonth() + 1}`;
            months.add(JSON.stringify({ label, value }));
        });

        csvOrders.forEach(o => {
            const d = new Date(o.orderDate);
            const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
            const value = `${d.getFullYear()}-${d.getMonth() + 1}`;
            months.add(JSON.stringify({ label, value }));
        });

        const sortedMonths = Array.from(months)
            .map(m => JSON.parse(m))
            .sort((a, b) => {
                const [y1, m1] = a.value.split('-').map(Number);
                const [y2, m2] = b.value.split('-').map(Number);
                return (y2 * 12 + m2) - (y1 * 12 + m1);
            });

        res.json(sortedMonths);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get global stats
router.get('/stats', async (req, res) => {
    try {
        const { month, year } = req.query;
        let where = {};

        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
            where.shopifyCreatedAt = {
                gte: startDate,
                lte: endDate
            };
        }

        const totalOrders = await prisma.order.count({ where });
        const revenueAgg = await prisma.order.aggregate({
            where,
            _sum: { totalAmount: true }
        });
        const couponOrders = await prisma.order.count({
            where: { ...where, NOT: { couponCode: null } }
        });
        const campaignOrders = await prisma.order.count({
            where: { ...where, NOT: { campaignId: null } }
        });

        // revenueByDay for line chart (last 30 days or selected month)
        const ordersForChart = await prisma.order.findMany({
            where,
            select: { shopifyCreatedAt: true, totalAmount: true },
            orderBy: { shopifyCreatedAt: 'asc' }
        });

        const revenueMap = {};
        ordersForChart.forEach(o => {
            const dateStr = new Date(o.shopifyCreatedAt).toISOString().split('T')[0];
            revenueMap[dateStr] = (revenueMap[dateStr] || 0) + parseFloat(o.totalAmount);
        });
        const revenueByDay = Object.keys(revenueMap).map(date => ({ date, revenue: revenueMap[date] }));

        // Top Performers
        const bestCampaign = await prisma.campaign.findFirst({
            include: { _count: { select: { orders: true } } },
            orderBy: { orders: { _count: 'desc' } }
        });
        // For Campaign revenue we need manual agg
        let bestCampaignData = { name: 'None', revenue: 0 };
        if (bestCampaign) {
            const campRev = await prisma.order.aggregate({
                where: { campaignId: bestCampaign.id },
                _sum: { totalAmount: true }
            });
            bestCampaignData = { name: bestCampaign.name, revenue: parseFloat(campRev._sum.totalAmount || 0) };
        }

        const bestCouponGroup = await prisma.order.groupBy({
            by: ['couponCode'],
            where: { couponCode: { not: null } },
            _sum: { totalAmount: true },
            orderBy: { _sum: { totalAmount: 'desc' } },
            take: 1
        });
        const bestCouponData = bestCouponGroup.length > 0 ? { code: bestCouponGroup[0].couponCode, revenue: parseFloat(bestCouponGroup[0]._sum.totalAmount || 0) } : { code: 'None', revenue: 0 };

        const platformGroup = await prisma.order.groupBy({
            by: ['platformSource'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 1
        });
        const bestPlatformData = platformGroup.length > 0 ? { name: platformGroup[0].platformSource, count: platformGroup[0]._count.id } : { name: 'None', count: 0 };

        res.json({
            totalOrders,
            totalRevenue: parseFloat(revenueAgg._sum.totalAmount || 0),
            ordersFromCoupons: couponOrders,
            ordersFromCampaigns: campaignOrders,
            conversionRate: 3.2,
            revenueByDay,
            topPerformers: {
                bestCampaign: bestCampaignData,
                bestCoupon: bestCouponData,
                bestPlatform: bestPlatformData
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get comprehensive analytics
router.get('/analytics', async (req, res) => {
    try {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // 1. Performance Overview (Growth, AOV, etc.)
        const currentRevenue = await prisma.order.aggregate({
            where: {
                financialStatus: { in: ['paid', 'partially_paid'] },
                shopifyCreatedAt: { gte: startOfCurrentMonth }
            },
            _sum: { totalAmount: true },
            _count: { id: true }
        });

        const lastRevenue = await prisma.order.aggregate({
            where: {
                financialStatus: { in: ['paid', 'partially_paid'] },
                shopifyCreatedAt: { gte: startOfLastMonth, lte: endOfLastMonth }
            },
            _sum: { totalAmount: true }
        });

        const curRevVal = parseFloat(currentRevenue._sum.totalAmount || 0);
        const lastRevVal = parseFloat(lastRevenue._sum.totalAmount || 0);
        let growth = 0;
        if (lastRevVal > 0) growth = ((curRevVal - lastRevVal) / lastRevVal) * 100;
        else if (curRevVal > 0) growth = 100;

        const totalOrderCount = currentRevenue._count.id || 0;
        const aov = totalOrderCount > 0 ? (curRevVal / totalOrderCount) : 0;

        // 2. Revenue by Platform
        const platformRevenue = await prisma.order.groupBy({
            by: ['platformSource'],
            where: { financialStatus: { in: ['paid', 'partially_paid'] } },
            _sum: { totalAmount: true }
        });

        // 3. Conversion Funnel (Global)
        const totalLeads = await prisma.lead.count();
        const totalOrders = await prisma.order.count();
        const convertedLeads = await prisma.lead.count({ where: { status: 'CONVERTED' } });

        // 4. Platform Comparison
        const platforms = await prisma.order.groupBy({
            by: ['platformSource'],
            where: { financialStatus: { in: ['paid', 'partially_paid'] } },
            _sum: { totalAmount: true },
            _count: { id: true }
        });

        const comparison = await Promise.all(platforms.map(async (p) => {
            const platformLeads = await prisma.lead.count({
                where: { platformSource: p.platformSource }
            });
            const platformOrders = p._count.id || 0;
            const convRate = platformLeads > 0 ? (platformOrders / platformLeads) * 100 : 0;
            const revenue = parseFloat(p._sum.totalAmount || 0);

            return {
                platform: p.platformSource || 'Organic',
                revenue: revenue,
                orders: platformOrders,
                aov: platformOrders > 0 ? (revenue / platformOrders) : 0,
                conv: convRate.toFixed(1) + '%'
            };
        }));

        res.json({
            kpis: [
                { title: 'Revenue Growth', value: growth.toFixed(1) + '%', trend: growth >= 0 ? 'up' : 'down', trendValue: growth.toFixed(1) + '%', icon: 'ph-graph', iconColor: 'primary' },
                { title: 'Total Leads', value: totalLeads.toLocaleString(), trend: '-', trendValue: '', icon: 'ph-users', iconColor: 'secondary' },
                { title: 'Avg Order Value', value: '₹' + aov.toFixed(2), trend: '-', trendValue: '', icon: 'ph-currency-dollar', iconColor: 'warning' },
                { title: 'Conversion Rate', value: (totalLeads > 0 ? (totalOrders / totalLeads) * 100 : 0).toFixed(1) + '%', trend: '-', trendValue: '', icon: 'ph-arrows-left-right', iconColor: 'primary' },
            ],
            platformRevenue: {
                labels: platformRevenue.map(p => p.platformSource || 'Organic'),
                data: platformRevenue.map(p => parseFloat(p._sum.totalAmount || 0))
            },
            funnel: [
                { label: 'Leads', value: totalLeads },
                { label: 'Converted', value: convertedLeads },
                { label: 'Orders', value: totalOrders }
            ],
            comparison
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get recent orders (Unified view: Shopify + CSV)
router.get('/orders', async (req, res) => {
    try {
        const { month, year } = req.query;
        let orderWhere = {};
        let csvWhere = {};

        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

            orderWhere.shopifyCreatedAt = { gte: startDate, lte: endDate };
            csvWhere.orderDate = { gte: startDate, lte: endDate };
        }

        // Fetch from both tables
        const [shopifyOrders, csvOrders] = await Promise.all([
            prisma.order.findMany({
                where: orderWhere,
                orderBy: { shopifyCreatedAt: 'desc' },
                include: { campaign: true }
            }),
            prisma.cSVOrderRecord.findMany({
                where: csvWhere,
                orderBy: { orderDate: 'desc' }
            })
        ]);

        // Map CSV orders to the same format as Shopify orders for the frontend
        const normalizedCsvOrders = csvOrders.map(csv => ({
            id: `csv_${csv.id}`,
            shopifyOrderId: csv.orderId,
            customerName: csv.customerName,
            customerPhone: csv.customerPhone,
            totalAmount: csv.orderAmount,
            shopifyCreatedAt: csv.orderDate,
            lineItems: csv.productName,
            platformSource: 'CSV Upload',
            isCsv: true
        }));

        // Merge and sort
        const combined = [...shopifyOrders, ...normalizedCsvOrders].sort((a, b) =>
            new Date(b.shopifyCreatedAt) - new Date(a.shopifyCreatedAt)
        );

        res.json(combined);
    } catch (err) {
        console.error('[API] /orders error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get recent campaigns
router.get('/campaigns', async (req, res) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            include: {
                coupon: true,
                _count: { select: { orders: true, leads: true } }
            }
        });

        const result = await Promise.all(campaigns.map(async (camp) => {
            const revenueAgg = await prisma.order.aggregate({
                where: { campaignId: camp.id },
                _sum: { totalAmount: true }
            });
            return {
                ...camp,
                revenue: revenueAgg._sum.totalAmount || 0
            };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get campaign stats for KPI cards
router.get('/campaigns/stats', async (req, res) => {
    try {
        const totalCampaigns = await prisma.campaign.count();
        const activeCampaigns = await prisma.campaign.count({
            where: { status: 'Active' }
        });

        const campaigns = await prisma.campaign.findMany({
            select: { platformSource: true, id: true }
        });
        const platforms = new Set(campaigns.map(c => c.platformSource));

        const revenueAgg = await prisma.order.aggregate({
            _sum: { totalAmount: true }
        });

        res.json({
            totalCampaigns,
            activeCampaigns,
            platformsUsed: platforms.size,
            totalRevenue: parseFloat(revenueAgg._sum.totalAmount || 0)
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all leads
router.get('/leads', async (req, res) => {
    try {
        const leads = await prisma.lead.findMany({
            include: {
                campaign: {
                    select: { name: true }
                }
            },
            orderBy: { uploadedAt: 'desc' }
        });
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a lead
router.put('/leads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, status } = req.body;

        // Build update data - only include fields that were provided
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone || null;
        if (status !== undefined) updateData.status = status;

        const lead = await prisma.lead.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json(lead);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get coupons (High-Trust: Aggregated from Orders + Coupon Table)
router.get('/coupons', async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Get all coupons from coupon table (to ensure we show all)
        const allCoupons = await prisma.coupon.findMany({
            select: { code: true, id: true, status: true }
        });

        // 2. Get coupon order stats
        const couponGroups = await prisma.order.groupBy({
            by: ['couponCode'],
            where: {
                couponCode: { not: null, notIn: COUPON_BLOCKLIST },
                financialStatus: { in: ['paid', 'partially_paid'] }
            },
            _sum: { totalAmount: true },
            _count: { id: true },
            _max: { shopifyCreatedAt: true }
        });

        const couponMap = new Map(couponGroups.map(g => [g.couponCode, g]));

        const result = await Promise.all(allCoupons.map(async (coupon) => {
            const group = couponMap.get(coupon.code);

            const currentMonthAgg = await prisma.order.aggregate({
                where: {
                    couponCode: coupon.code,
                    financialStatus: { in: ['paid', 'partially_paid'] },
                    shopifyCreatedAt: { gte: startOfMonth }
                },
                _sum: { totalAmount: true }
            });

            return {
                code: coupon.code,
                status: coupon.status || 'Active',
                ordersCount: group ? (group._count.id || 0) : 0,
                totalRevenue: group ? parseFloat(group._sum.totalAmount || 0) : 0,
                currentMonthRevenue: parseFloat(currentMonthAgg._sum.totalAmount || 0),
                lastUsed: group ? group._max.shopifyCreatedAt : null,
                aov: group && group._count.id > 0 ? parseFloat((parseFloat(group._sum.totalAmount || 0) / group._count.id).toFixed(2)) : 0
            };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get advanced coupon performance (Aggregated from Orders)
router.get('/coupons/performance', async (req, res) => {
    try {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const couponGroups = await prisma.order.groupBy({
            by: ['couponCode'],
            where: {
                couponCode: { not: null, notIn: COUPON_BLOCKLIST },
                financialStatus: { in: ['paid', 'partially_paid'] }
            },
            _sum: { totalAmount: true },
            _count: { id: true },
            _max: { shopifyCreatedAt: true }
        });

        const performance = await Promise.all(couponGroups.map(async (group) => {
            const currentMonthStats = await prisma.order.aggregate({
                where: {
                    couponCode: group.couponCode,
                    financialStatus: { in: ['paid', 'partially_paid'] },
                    shopifyCreatedAt: { gte: startOfCurrentMonth }
                },
                _sum: { totalAmount: true },
                _count: { id: true }
            });

            const lastMonthStats = await prisma.order.aggregate({
                where: {
                    couponCode: group.couponCode,
                    financialStatus: { in: ['paid', 'partially_paid'] },
                    shopifyCreatedAt: {
                        gte: startOfLastMonth,
                        lte: endOfLastMonth
                    }
                },
                _sum: { totalAmount: true }
            });

            const totalRev = parseFloat(group._sum.totalAmount || 0);
            const totalOrders = group._count.id || 0;
            const currentRev = parseFloat(currentMonthStats._sum.totalAmount || 0);
            const lastRev = parseFloat(lastMonthStats._sum.totalAmount || 0);

            let trend = 0;
            if (lastRev > 0) {
                trend = ((currentRev - lastRev) / lastRev) * 100;
            } else if (currentRev > 0) {
                trend = 100;
            }

            return {
                couponCode: group.couponCode,
                status: 'Active',
                totalOrders: totalOrders,
                totalRevenue: totalRev,
                monthlyRevenue: currentRev,
                currentMonthRevenue: currentRev,
                totalOrdersCount: totalOrders,
                monthlyOrdersCount: currentMonthStats._count.id || 0,
                lastUsed: group._max.shopifyCreatedAt || null,
                aov: totalOrders > 0 ? parseFloat((totalRev / totalOrders).toFixed(2)) : 0,
                trendPercentage: parseFloat(trend.toFixed(1))
            };
        }));

        res.json(performance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get detailed coupon breakdown
router.get('/coupons/:code/details', async (req, res) => {
    try {
        const { code } = req.params;

        const orders = await prisma.order.findMany({
            where: {
                couponCode: code,
                financialStatus: { in: ['paid', 'partially_paid'] }
            },
            orderBy: { shopifyCreatedAt: 'desc' }
        });

        const monthlyData = {};
        orders.forEach(order => {
            const date = new Date(order.shopifyCreatedAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { month: monthKey, revenue: 0, orders: 0 };
            }
            monthlyData[monthKey].revenue += parseFloat(order.totalAmount);
            monthlyData[monthKey].orders += 1;
        });

        const recentOrders = orders.slice(0, 50).map(o => ({
            id: o.shopifyOrderId,
            amount: parseFloat(o.totalAmount),
            date: o.shopifyCreatedAt,
            email: o.customerEmail,
            name: o.customerName,
            phone: o.customerPhone,
            lineItems: o.lineItems
        }));

        res.json({
            coupon_code: code,
            monthly_breakdown: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
            recent_orders: recentOrders
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new campaign
router.post('/campaigns', async (req, res) => {
    try {
        const { name, platformSource, couponCode } = req.body;

        // Find or create shop (simplified for now)
        const shop = await prisma.shop.findFirst();

        const campaign = await prisma.campaign.create({
            data: {
                name,
                platformSource,
                shopId: shop.id, // Ensure your schema has shopId if needed, but Campaign currently doesn't link to Shop in schema? Wait, let me check schema again.
                // Campaign model: name, platformSource, coupon (relation), orders, leads. No shopId.
            }
        });

        if (couponCode) {
            await prisma.coupon.create({
                data: {
                    code: couponCode,
                    shopId: shop.id,
                    campaignId: campaign.id,
                    status: 'ACTIVE'
                }
            });
        }

        res.json(campaign);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit a campaign
router.put('/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, platformSource, couponCode } = req.body;

        const campaign = await prisma.campaign.update({
            where: { id: parseInt(id) },
            data: {
                name,
                platformSource
            }
        });

        if (couponCode) {
            // Find shop
            const shop = await prisma.shop.findFirst();
            await prisma.coupon.upsert({
                where: { campaignId: campaign.id },
                update: { code: couponCode },
                create: {
                    code: couponCode,
                    shopId: shop.id,
                    campaignId: campaign.id,
                    status: 'ACTIVE'
                }
            });
        }

        res.json(campaign);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a campaign
router.delete('/campaigns/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Deletion order: Leads -> Coupon -> Orders -> Campaign (if not using cascade)
        // Since we want to keep order history but disassociate from campaign, we update orders
        await prisma.order.updateMany({
            where: { campaignId: parseInt(id) },
            data: { campaignId: null }
        });

        await prisma.lead.deleteMany({
            where: { campaignId: parseInt(id) }
        });

        await prisma.coupon.deleteMany({
            where: { campaignId: parseInt(id) }
        });

        await prisma.campaign.delete({
            where: { id: parseInt(id) }
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Leads
router.post('/leads/upload', async (req, res) => {
    try {
        const { campaignId, leads } = req.body; // leads is an array of {name, email, phone, platformSource}

        const createdLeads = await Promise.all(leads.map(async (lead) => {
            try {
                const email = lead.email && lead.email.trim() !== '' ? lead.email.trim() : null;
                const phone = lead.phone && lead.phone.trim() !== '' ? lead.phone.trim() : null;
                const name = lead.name || 'Anonymous';

                // If email exists, try to upsert on it
                if (email) {
                    return await prisma.lead.upsert({
                        where: {
                            campaignId_email: {
                                campaignId: parseInt(campaignId),
                                email: email
                            }
                        },
                        update: { name, phone, platformSource: lead.platformSource },
                        create: {
                            name, email, phone,
                            campaignId: parseInt(campaignId),
                            platformSource: lead.platformSource,
                            status: 'PENDING'
                        }
                    });
                } else {
                    // No email - always create new to avoid collision issues with nulls in upsert 'where'
                    return await prisma.lead.create({
                        data: {
                            name, email, phone,
                            campaignId: parseInt(campaignId),
                            platformSource: lead.platformSource,
                            status: 'PENDING'
                        }
                    });
                }
            } catch (e) {
                console.error('Error importing lead:', lead.email, e.message);
                return null;
            }
        }));

        const count = createdLeads.filter(l => l !== null).length;
        res.json({ success: true, count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get campaign details including funnel and leads
router.get('/campaigns/:id/details', async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(id) },
            include: {
                coupon: true,
                leads: true,
                _count: { select: { orders: true, leads: true } }
            }
        });

        if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

        // Calculate Revenue
        const revenueAgg = await prisma.order.aggregate({
            where: { campaignId: campaign.id },
            _sum: { totalAmount: true }
        });

        // Conversion stats
        const uploadedLeads = campaign.leads.length;
        const convertedLeads = campaign.leads.filter(l => l.status === 'CONVERTED').length;
        const totalOrders = campaign._count.orders;
        const totalRevenue = parseFloat(revenueAgg._sum.totalAmount || 0);

        res.json({
            ...campaign,
            stats: {
                uploadedLeads,
                validLeads: uploadedLeads, // Simplified: assumption all are valid for now
                orders: totalOrders,
                convertedLeads,
                revenue: totalRevenue
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==== REPEAT CUSTOMER DETECTION FEATURE ====

const customerAnalysisService = require('../services/customer-analysis');

// Upload CSV and process repeat customer data
router.post('/customers/upload-csv', async (req, res) => {
    try {
        const { csvContent, compareWithPrevious } = req.body;

        if (!csvContent) {
            return res.status(400).json({ error: 'CSV content is required' });
        }

        // Create upload record
        const upload = await prisma.cSVUpload.create({
            data: {
                fileName: 'orders.csv',
                fileSize: csvContent.length,
                totalRows: 0,
                status: 'PROCESSING',
                processedAt: null
            }
        });

        // Process CSV asynchronously
        customerAnalysisService.processCSVUpload(csvContent, upload.id, null, compareWithPrevious)
            .catch(err => {
                console.error('CSV processing error:', err);
            });

        res.json({
            success: true,
            uploadId: upload.id,
            message: 'CSV upload started. Processing in progress...'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get upload status
router.get('/customers/upload-status/:uploadId', async (req, res) => {
    try {
        const { uploadId } = req.params;

        const upload = await prisma.cSVUpload.findUnique({
            where: { id: parseInt(uploadId) }
        });

        if (!upload) {
            return res.status(404).json({ error: 'Upload not found' });
        }

        res.json(upload);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get customer analysis list for an upload
router.get('/customers/analysis/:uploadId', async (req, res) => {
    try {
        const { uploadId } = req.params;
        const { customerType, searchPhone, searchProduct, sortBy, sortOrder } = req.query;

        const customers = await customerAnalysisService.getCustomerAnalysis(
            parseInt(uploadId),
            {
                customerType,
                searchPhone,
                searchProduct,
                sortBy,
                sortOrder
            }
        );

        res.json({ customers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get overview stats for an upload
router.get('/customers/stats/:uploadId', async (req, res) => {
    try {
        const { uploadId } = req.params;

        const stats = await customerAnalysisService.getUploadStats(parseInt(uploadId));

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get customer detail with order history
router.get('/customers/detail/:uploadId/:customerPhone', async (req, res) => {
    try {
        const { uploadId, customerPhone } = req.params;

        const customer = await customerAnalysisService.getCustomerDetail(
            parseInt(uploadId),
            customerPhone
        );

        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export customers data (CSV or JSON)
router.get('/customers/export/:uploadId', async (req, res) => {
    try {
        const { uploadId } = req.params;
        const { format, customersOnly } = req.query;

        const customers = await customerAnalysisService.getCustomerAnalysis(
            parseInt(uploadId)
        );

        let exportData = customers.map(c => ({
            'Customer Phone': c.customerPhone,
            'Customer Type': c.customerType,
            'Total Orders': c.totalOrders,
            'Products Bought': c.productsBought.join('; '),
            'Total Spent': c.totalSpent,
            'First Order Date': new Date(c.firstOrderDate).toISOString().split('T')[0],
            'Last Order Date': new Date(c.lastOrderDate).toISOString().split('T')[0]
        }));

        // Filter to repeat customers only if requested
        if (customersOnly === 'repeat') {
            exportData = exportData.filter(c => c['Customer Type'] === 'Repeat');
        }

        if (format === 'csv') {
            // Convert to CSV format
            const headers = Object.keys(exportData[0]);
            const csvContent = [
                headers.join(','),
                ...exportData.map(row =>
                    headers.map(h => {
                        const val = row[h];
                        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
                    }).join(',')
                )
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvContent);
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.json"`);
            res.json(exportData);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all uploads list
router.get('/customers/uploads', async (req, res) => {
    try {
        const uploads = await prisma.cSVUpload.findMany({
            orderBy: { uploadedAt: 'desc' },
            include: {
                _count: { select: { analysisRecords: true } }
            }
        });

        const formatted = uploads.map(u => ({
            id: u.id,
            fileName: u.fileName,
            status: u.status,
            totalRows: u.totalRows,
            uploadedAt: u.uploadedAt,
            processedAt: u.processedAt,
            errorMessage: u.errorMessage,
            customerCount: u._count.analysisRecords
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a CSV upload and all associated data
router.delete('/customers/uploads/:uploadId', async (req, res) => {
    try {
        const { uploadId } = req.params;
        const id = parseInt(uploadId);

        // Verify upload exists
        const upload = await prisma.cSVUpload.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        analysisRecords: true,
                        orderRecords: true
                    }
                }
            }
        });

        if (!upload) {
            return res.status(404).json({ error: 'Upload not found' });
        }

        // Get all customer phones from this upload before deletion
        const orderRecords = await prisma.cSVOrderRecord.findMany({
            where: { uploadId: id },
            select: { customerPhone: true }
        });

        const affectedPhones = [...new Set(orderRecords.map(r => r.customerPhone))];

        // Delete the upload (cascade will handle CustomerAnalysis and CSVOrderRecord)
        await prisma.cSVUpload.delete({
            where: { id }
        });

        // Recalculate global customer stats for affected customers
        for (const phone of affectedPhones) {
            // Get remaining orders for this customer
            const remainingOrders = await prisma.cSVOrderRecord.findMany({
                where: { customerPhone: phone },
                orderBy: { orderDate: 'desc' }
            });

            if (remainingOrders.length === 0) {
                // No more orders - delete customer
                await prisma.customer.deleteMany({
                    where: { phone }
                });
            } else {
                // Recalculate customer stats
                const uniqueOrderIds = new Set(remainingOrders.map(o => o.orderId));
                const totalOrders = uniqueOrderIds.size;
                const totalSpent = remainingOrders.reduce((sum, o) => sum + parseFloat(o.orderAmount || 0), 0);
                const products = [...new Set(remainingOrders.map(o => o.productName))];
                const cities = [...new Set(remainingOrders.map(o => o.city).filter(Boolean))];
                const latestOrder = remainingOrders[0];
                const oldestOrder = remainingOrders[remainingOrders.length - 1];

                await prisma.customer.updateMany({
                    where: { phone },
                    data: {
                        totalOrders,
                        isRepeatCustomer: totalOrders >= 2,
                        totalSpent,
                        lastProductOrdered: latestOrder.productName,
                        lastOrderDate: latestOrder.orderDate,
                        firstOrderDate: oldestOrder.orderDate,
                        productsBought: JSON.stringify(products),
                        allCities: JSON.stringify(cities),
                        name: latestOrder.customerName || undefined,
                        city: latestOrder.city || undefined
                    }
                });
            }
        }

        res.json({
            success: true,
            message: 'Upload deleted successfully',
            deletedRecords: {
                analysisRecords: upload._count.analysisRecords,
                orderRecords: upload._count.orderRecords
            },
            affectedCustomers: affectedPhones.length
        });
    } catch (err) {
        console.error('[DELETE Upload] Error:', err);
        res.status(500).json({ error: err.message });
    }
});


// ==== GLOBAL CUSTOMER TABLE ENDPOINTS ====

// Get all customers from global table with filters
router.get('/customers/all', async (req, res) => {
    try {
        const {
            repeatOnly,
            searchPhone,
            searchName,
            searchCity,
            sortBy = 'totalOrders',
            sortOrder = 'desc',
            limit = 100
        } = req.query;

        const customers = await customerAnalysisService.getCustomers({
            isRepeatOnly: repeatOnly === 'true',
            searchPhone,
            searchName,
            searchCity,
            sortBy,
            sortOrder,
            limit: parseInt(limit)
        });

        res.json({ customers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get customer by phone number
router.get('/customers/phone/:phone', async (req, res) => {
    try {
        const { phone } = req.params;

        const customer = await customerAnalysisService.getCustomerByPhone(phone);

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get global customer statistics
router.get('/customers/global-stats', async (req, res) => {
    try {
        const stats = await customerAnalysisService.getGlobalStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get global customer statistics
router.get('/customers/global-stats', async (req, res) => {
    try {
        const stats = await customerAnalysisService.getGlobalStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export customers with filters applied
router.get('/customers/export-filtered', async (req, res) => {
    try {
        const {
            repeatOnly,
            searchPhone,
            searchName,
            searchCity,
            sortBy = 'totalOrders',
            sortOrder = 'desc',
            format = 'csv',
            uploadId // Optional: filter by specific upload
        } = req.query;

        let customers;

        if (uploadId) {
            // Export customers from specific upload
            customers = await customerAnalysisService.getCustomerAnalysis(
                parseInt(uploadId),
                {
                    customerType: repeatOnly === 'true' ? 'Repeat' : null,
                    searchPhone,
                    sortBy,
                    sortOrder
                }
            );

            // Map to consistent format
            customers = customers.map(c => ({
                name: c.customerName,
                phone: c.customerPhone,
                city: c.location || '—',
                totalOrders: c.globalTotalOrders || c.totalOrders,
                isRepeatCustomer: c.isRepeatCustomer,
                lastProductOrdered: c.productsBought?.[c.productsBought.length - 1] || '—',
                lastOrderDate: c.lastOrderDate,
                totalSpent: c.globalTotalSpent || c.totalSpent
            }));
        } else {
            // Export from global customer table
            customers = await customerAnalysisService.getCustomers({
                isRepeatOnly: repeatOnly === 'true',
                searchPhone,
                searchName,
                searchCity,
                sortBy,
                sortOrder,
                limit: 10000 // High limit for export
            });

            // Map to export format
            customers = customers.map(c => ({
                name: c.name,
                phone: c.phone,
                city: c.city || '—',
                totalOrders: c.totalOrders,
                isRepeatCustomer: c.isRepeatCustomer,
                lastProductOrdered: c.lastProductOrdered || '—',
                lastOrderDate: c.lastOrderDate,
                totalSpent: c.totalSpent
            }));
        }

        // Apply name and city filters if needed (for upload-specific exports)
        if (searchName) {
            customers = customers.filter(c =>
                c.name?.toLowerCase().includes(searchName.toLowerCase())
            );
        }
        if (searchCity) {
            customers = customers.filter(c =>
                c.city?.toLowerCase().includes(searchCity.toLowerCase())
            );
        }

        // Aggregate products from actual order records for each customer
        const exportData = await Promise.all(customers.map(async (c) => {
            let allProducts = 'N/A';

            try {
                // Query ALL order records for this customer phone
                const orderRecords = await prisma.cSVOrderRecord.findMany({
                    where: {
                        customerPhone: c.phone
                    },
                    select: {
                        productName: true
                    }
                });

                if (orderRecords && orderRecords.length > 0) {
                    // Extract product names, filter out nulls/empty, and deduplicate
                    const products = orderRecords
                        .map(o => o.productName)
                        .filter(p => p && p.trim() !== '');

                    if (products.length > 0) {
                        const uniqueProducts = [...new Set(products)];
                        allProducts = uniqueProducts.join(' | ');
                    }
                }
            } catch (e) {
                console.error(`Error fetching products for ${c.phone}:`, e);
                allProducts = 'N/A';
            }

            return {
                'Customer Name': c.name || '—',
                'Phone': c.phone,
                'City': c.city,
                'Total Orders': c.totalOrders,
                'Repeat Status': c.isRepeatCustomer ? 'Repeat' : 'New',
                'All Products Purchased': allProducts,
                'Last Order Date': c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—',
                'Total Spent': `₹${parseFloat(c.totalSpent || 0).toFixed(2)}`
            };
        }));

        if (format === 'csv') {
            // Convert to CSV format
            if (exportData.length === 0) {
                return res.status(404).json({ error: 'No customers found matching filters' });
            }

            const headers = Object.keys(exportData[0]);
            const csvContent = [
                headers.join(','),
                ...exportData.map(row =>
                    headers.map(h => {
                        const val = row[h];
                        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
                    }).join(',')
                )
            ].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvContent);
        } else {
            // JSON format
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="customers-${new Date().toISOString().split('T')[0]}.json"`);
            res.json(exportData);
        }
    } catch (err) {
        console.error('[Export Filtered] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==== SUBSCRIPTION SYSTEM ENDPOINTS ====

const subscriptionService = require('../services/subscription-service');

// Get all subscriptions (product-based subscription plans)
router.get('/subscriptions', async (req, res) => {
    try {
        const { isActive, searchProduct, sortBy, sortOrder, limit } = req.query;

        const subscriptions = await subscriptionService.getAllSubscriptions({
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : null,
            searchProduct,
            sortBy: sortBy || 'totalSubscribers',
            sortOrder: sortOrder || 'desc',
            limit: parseInt(limit) || 100
        });

        res.json({ subscriptions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get subscription statistics
router.get('/subscriptions/stats', async (req, res) => {
    try {
        const stats = await subscriptionService.getSubscriptionStats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get subscription by product name
router.get('/subscriptions/product/:productName', async (req, res) => {
    try {
        const { productName } = req.params;
        const subscription = await subscriptionService.getSubscriptionByProduct(decodeURIComponent(productName));

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found for this product' });
        }

        res.json(subscription);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get customer's subscriptions
router.get('/subscriptions/customer/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        const { includeInactive } = req.query;

        const subscriptions = await subscriptionService.getCustomerSubscriptions(
            phone,
            includeInactive === 'true'
        );

        res.json({ subscriptions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel a customer's subscription
router.post('/subscriptions/cancel', async (req, res) => {
    try {
        const { customerPhone, subscriptionId } = req.body;

        if (!customerPhone || !subscriptionId) {
            return res.status(400).json({ error: 'customerPhone and subscriptionId are required' });
        }

        const result = await subscriptionService.cancelSubscription(customerPhone, subscriptionId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a subscription plan
router.delete('/subscriptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const subscriptionId = parseInt(id);

        if (isNaN(subscriptionId)) {
            return res.status(400).json({ error: 'Invalid subscription ID' });
        }

        // Get subscription details before deleting
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: {
                _count: {
                    select: {
                        customerSubscriptions: true
                    }
                }
            }
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        // Delete the subscription (cascade will delete customer subscriptions)
        await prisma.subscription.delete({
            where: { id: subscriptionId }
        });

        res.json({
            success: true,
            message: `Deleted subscription "${subscription.productName}" and ${subscription._count.customerSubscriptions} associated customer subscription(s)`
        });
    } catch (err) {
        console.error('[DELETE /subscriptions/:id] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Sync subscriptions from existing order data (backfill)
router.post('/subscriptions/sync', async (req, res) => {
    try {
        const result = await subscriptionService.syncSubscriptionsFromOrders();
        res.json({
            success: true,
            message: `Synced ${result.created} new and ${result.updated} renewed subscriptions`,
            ...result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==== LEADS ENDPOINTS ====

// Get all leads
router.get('/leads', async (req, res) => {
    try {
        const leads = await prisma.lead.findMany({
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        platformSource: true
                    }
                }
            },
            orderBy: { uploadedAt: 'desc' }
        });

        res.json(leads);
    } catch (err) {
        console.error('[GET /leads] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create a single lead
router.post('/leads', async (req, res) => {
    try {
        const { name, email, phone, campaignId, platformSource, status } = req.body;

        // Validate required fields
        if (!campaignId) {
            return res.status(400).json({ error: 'campaignId is required' });
        }

        if (!email && !phone) {
            return res.status(400).json({ error: 'Either email or phone is required' });
        }

        // Check if campaign exists
        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(campaignId) }
        });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Create the lead
        const lead = await prisma.lead.create({
            data: {
                name: name || null,
                email: email || null,
                phone: phone || null,
                campaignId: parseInt(campaignId),
                platformSource: platformSource || campaign.platformSource,
                status: status || 'PENDING'
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        platformSource: true
                    }
                }
            }
        });

        res.json(lead);
    } catch (err) {
        console.error('[POST /leads] Error:', err);

        // Handle unique constraint violation
        if (err.code === 'P2002') {
            return res.status(400).json({
                error: 'A lead with this email already exists for this campaign'
            });
        }

        res.status(500).json({ error: err.message });
    }
});

// Update a lead
router.put('/leads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, status, platformSource } = req.body;

        const lead = await prisma.lead.update({
            where: { id: parseInt(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(email !== undefined && { email }),
                ...(phone !== undefined && { phone }),
                ...(status !== undefined && { status }),
                ...(platformSource !== undefined && { platformSource })
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        name: true,
                        platformSource: true
                    }
                }
            }
        });

        res.json(lead);
    } catch (err) {
        console.error('[PUT /leads/:id] Error:', err);

        if (err.code === 'P2025') {
            return res.status(404).json({ error: 'Lead not found' });
        }

        res.status(500).json({ error: err.message });
    }
});

// Upload bulk leads
router.post('/leads/upload', async (req, res) => {
    try {
        const { campaignId, leads } = req.body;

        if (!campaignId || !Array.isArray(leads) || leads.length === 0) {
            return res.status(400).json({
                error: 'campaignId and leads array are required'
            });
        }

        // Check if campaign exists
        const campaign = await prisma.campaign.findUnique({
            where: { id: parseInt(campaignId) }
        });

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Create leads in bulk
        const createdLeads = [];
        const errors = [];

        for (const leadData of leads) {
            try {
                const lead = await prisma.lead.create({
                    data: {
                        name: leadData.name || null,
                        email: leadData.email || null,
                        phone: leadData.phone || null,
                        campaignId: parseInt(campaignId),
                        platformSource: leadData.platformSource || campaign.platformSource,
                        status: leadData.status || 'PENDING'
                    }
                });
                createdLeads.push(lead);
            } catch (err) {
                // Skip duplicates
                if (err.code === 'P2002') {
                    errors.push({
                        email: leadData.email,
                        error: 'Duplicate lead'
                    });
                } else {
                    errors.push({
                        email: leadData.email,
                        error: err.message
                    });
                }
            }
        }

        res.json({
            success: true,
            created: createdLeads.length,
            errors: errors.length,
            leads: createdLeads,
            errorDetails: errors
        });
    } catch (err) {
        console.error('[POST /leads/upload] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
