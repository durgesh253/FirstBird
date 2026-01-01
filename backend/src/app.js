const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const webhookRoutes = require('./routes/webhooks');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());

// Capture raw body for Shopify HMAC verification
// Increase JSON body size limit to allow CSV uploads in request body.
// Keep `verify` to capture raw body for HMAC verification.
app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// Also support large urlencoded bodies (in case the client uses form submits)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());

app.use('/webhooks', webhookRoutes);
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send({ status: 'ok', service: 'SaaS Analytics Backend' });
});

module.exports = app;
