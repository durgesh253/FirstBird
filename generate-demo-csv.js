#!/usr/bin/env node

/**
 * Demo CSV Generator for Repeat Customer Detection Feature
 * 
 * Usage:
 *   node generate-demo-csv.js > demo-orders.csv
 *   node generate-demo-csv.js [count]
 * 
 * Examples:
 *   node generate-demo-csv.js           // 100 orders (default)
 *   node generate-demo-csv.js 1000      // 1000 orders
 */

const args = process.argv.slice(2);
const totalOrders = parseInt(args[0]) || 100;

// Sample data
const phoneNumbers = [
    '9876543210',
    '9123456789',
    '8765432109',
    '7654321098',
    '6543210987',
    '8888888888',
    '7777777777',
    '9999999999',
    '5555555555',
    '4444444444',
    '3333333333',
    '2222222222',
    '1111111111',
    '9000000001',
    '9000000002',
];

const products = [
    'iPhone IMEI Check',
    'Blacklist Status Check',
    'Warranty Check',
    'Device History Report',
    'Battery Health Assessment',
    'Activation Lock Status',
    'Screen Quality Analysis',
    'Camera Functionality Check',
    'Storage Health Report',
    'Network Compatibility Check',
];

const startDate = new Date('2024-01-01');
const endDate = new Date('2025-12-31');

function getRandomDate(from, to) {
    const time = from.getTime() + Math.random() * (to.getTime() - from.getTime());
    return new Date(time).toISOString().split('T')[0];
}

function getRandomPhone() {
    return phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
}

function getRandomProduct() {
    return products[Math.floor(Math.random() * products.length)];
}

function getRandomAmount() {
    const amounts = [25, 40, 50, 65, 75, 100, 125, 150];
    return amounts[Math.floor(Math.random() * amounts.length)];
}

// Generate CSV
console.log('order_id,customer_phone,product_name,order_date,order_amount');

for (let i = 1; i <= totalOrders; i++) {
    const orderId = `ORD${String(i).padStart(6, '0')}`;
    const phone = getRandomPhone();
    const product = getRandomProduct();
    const date = getRandomDate(startDate, endDate);
    const amount = getRandomAmount();

    console.log(`${orderId},${phone},${product},${date},${amount}`);
}

// Write usage stats to stderr
const uniquePhones = new Set(
    Array.from({ length: totalOrders }, getRandomPhone)
).size;

console.error('');
console.error('='.repeat(50));
console.error('CSV Generation Complete');
console.error('='.repeat(50));
console.error(`Total Orders: ${totalOrders}`);
console.error(`Estimated Unique Customers: ${uniquePhones}`);
console.error(`Products in Dataset: ${products.length}`);
console.error(`Date Range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
console.error('');
console.error('📋 CSV Output Format:');
console.error('   order_id,customer_phone,product_name,order_date,order_amount');
console.error('');
console.error('💡 Expected Results (approximate):');
console.error(`   - New Customers: ~${Math.round(uniquePhones * 0.6)}`);
console.error(`   - Repeat Customers: ~${Math.round(uniquePhones * 0.4)}`);
console.error('');
console.error('🚀 To upload, copy output to file:');
console.error('   node generate-demo-csv.js > demo-orders.csv');
console.error('='.repeat(50));
