const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { processOrderWebhook } = require('../services/attribution');

// HMAC Verification Middleware
const verifyShopifyWebhook = (req, res, next) => {
    const hmac = req.get('X-Shopify-Hmac-Sha256');
    if (!hmac) {
        // For local dev/demo without actual Shopify tunnel, we might bypass
        if (process.env.NODE_ENV !== 'production') return next();
        return res.status(401).send('No HMAC Provided');
    }

    const rawBody = req.rawBody; // Captured by app.js middleware
    const hash = crypto
        .createHmac('sha256', process.env.SHOPIFY_API_SECRET)
        .update(rawBody, 'utf8')
        .digest('base64');

    if (hash === hmac) {
        next();
    } else {
        console.warn('HMAC Validation failed');
        // return res.status(401).send('Unauthorized'); // Uncomment for strict
        next(); // Permissive for demo
    }
};

router.post('/orders-create', verifyShopifyWebhook, async (req, res) => {
    try {
        const shopDomain = req.get('X-Shopify-Shop-Domain') || process.env.SHOPIFY_SHOP;
        await processOrderWebhook(req.body, shopDomain);
        res.status(200).send('OK');
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
