import http from 'http';

const csvContent = `Name,Billing Name,Billing Phone,Shipping City,Lineitem Name,Total,Created At
#1001,Rajesh Kumar,9876543210,Mumbai,Wireless Earbuds Pro,1299.00,2025-12-01
#1001,Rajesh Kumar,9876543210,Mumbai,Phone Case Premium,499.00,2025-12-01
#1002,Priya Sharma,8765432109,Delhi,Smart Watch Elite,3999.00,2025-12-02
#1003,Amit Patel,7654321098,Bangalore,Laptop Stand Adjustable,1599.00,2025-12-03
#1004,Neha Gupta,9876543210,Mumbai,Bluetooth Speaker Mini,899.00,2025-12-05
#1005,Rahul Verma,6543210987,Chennai,USB-C Hub 7-in-1,1299.00,2025-12-06
#1006,Sneha Reddy,8765432109,Delhi,Wireless Charger Fast,799.00,2025-12-08
#1007,Vikram Singh,5432109876,Hyderabad,Gaming Mouse RGB,1499.00,2025-12-10
#1008,Anita Joshi,9876543210,Mumbai,Keyboard Mechanical,2499.00,2025-12-12`;

const data = JSON.stringify({ csvContent });

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers/upload-csv',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('Response:', body);
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
    process.exit(1);
});

req.write(data);
req.end();
