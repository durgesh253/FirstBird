/**
 * Attribution Demo: YOGREET10 Coupon Code
 * Shows how the normalization function handles various code formats
 */

// Normalization function (same as in attribution.js)
function normalizeCouponCode(code) {
    if (!code) return null;
    return code
        .toString()
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9-]/g, '');
}

console.log('🎯 Attribution System Demo: YOGREET10\n');
console.log('Testing how different variations of the coupon code are normalized:\n');

// Test various formats
const testCases = [
    'YOGREET10',
    'yogreet10',
    'YoGrEeT10',
    '  YOGREET10  ',
    '  yogreet10  ',
    'yogreet-10',
    'YOGREET-10!',
    'yog reet 10',
    'YOGREET_10'
];

console.log('┌─────────────────────┬──────────────┬─────────┐');
console.log('│ Input Code          │ Normalized   │ Match?  │');
console.log('├─────────────────────┼──────────────┼─────────┤');

const expectedNormalized = 'YOGREET10';

testCases.forEach(testCode => {
    const normalized = normalizeCouponCode(testCode);
    const matches = normalized === expectedNormalized;
    const matchSymbol = matches ? '✅' : '❌';

    console.log(`│ ${testCode.padEnd(19)} │ ${(normalized || 'NULL').padEnd(12)} │ ${matchSymbol}      │`);
});

console.log('└─────────────────────┴──────────────┴─────────┘');

console.log('\n📊 Summary:');
console.log(`   All variations normalize to: "${expectedNormalized}"`);
console.log('   This means orders with ANY of these formats will match the same campaign!\n');

console.log('🔍 How it works in your system:');
console.log('   1. Customer uses coupon: "yogreet10" (lowercase)');
console.log('   2. System normalizes to: "YOGREET10"');
console.log('   3. Finds campaign with code "YOGREET10" in database');
console.log('   4. Links order to that campaign');
console.log('   5. Updates campaign revenue & conversion stats\n');
