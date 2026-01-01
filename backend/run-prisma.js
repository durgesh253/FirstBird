const { spawnSync } = require('child_process');
const path = require('path');

const prismaCli = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');
const schemaPath = 'prisma/schema.prisma';

function run(args) {
    console.log(`Running: node "${prismaCli}" ${args.join(' ')}`);
    const result = spawnSync('node', [prismaCli, ...args], {
        stdio: 'inherit'
    });
    if (result.status !== 0) {
        console.error(`❌ Command failed with code ${result.status}`);
        process.exit(1);
    }
}

try {
    run(['db', 'push', '--schema', schemaPath, '--accept-data-loss']);
    run(['generate', '--schema', schemaPath]);
    console.log('✅ Prisma commands executed successfully.');
} catch (error) {
    console.error('❌ Error executing Prisma commands:', error.message);
    process.exit(1);
}
