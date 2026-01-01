#!/usr/bin/env node

const http = require('http');

// Test the /api/customers/uploads endpoint
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers/uploads',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        
        // Try to parse as JSON
        try {
            const parsed = JSON.parse(data);
            console.log('\n✅ API is working! Response is valid JSON');
            console.log('Uploads count:', parsed.length);
        } catch (e) {
            console.log('\n❌ Error: Response is not valid JSON');
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Error connecting to API:', e.message);
});

req.end();
