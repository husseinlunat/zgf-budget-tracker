import fs from 'fs';
import path from 'path';

// Load files manually to avoid ESM issues in node -e
const budgetDataPath = path.resolve('src/data/budgetData.js');
const seedRequestsPath = path.resolve('src/data/seedPaymentRequests.js');

const budgetDataContent = fs.readFileSync(budgetDataPath, 'utf8');
const seedRequestsContent = fs.readFileSync(seedRequestsPath, 'utf8');

// Extract budgetLines array (rough but works for script)
const linesJsonMatch = budgetDataContent.match(/export const budgetLines = (\[[\s\S]*?\]);/);
if (!linesJsonMatch) {
    console.error('Could not find budgetLines in budgetData.js');
    process.exit(1);
}
// Clean up the JS array to make it JSON-like enough for this check
const budgetLinesStr = linesJsonMatch[1]
    .replace(/\/\/.*$/gm, '') // Remove comments
    .replace(/,\s*\]/g, ']')  // Remove trailing commas
    .replace(/(\w+):/g, '"$1":'); // Quote keys
// Note: This might still fail if there are complex objects/functions, but let's try.
// Actually, it's easier to just use the existing logic.

// Since I can't easily import ESM in a script without top-level await or a setup,
// I'll just write a script that I run with `node` by enabling ESM or using a temporary .mjs file.

fs.writeFileSync('temp_check.mjs', `
import { budgetLines, samplePaymentRequests } from './src/data/budgetData.js';
import parsedRequests from './src/data/seedPaymentRequests.js';

const total = parsedRequests.length;
const mapped = samplePaymentRequests.length;

console.log('Total in seedPaymentRequests.js:', total);
console.log('Total in samplePaymentRequests (mapped):', mapped);

const sampleUnmapped = parsedRequests.filter(r => !samplePaymentRequests.some(s => s.id === r.id));
console.log('Unmapped count:', sampleUnmapped.length);

if (sampleUnmapped.length > 0) {
    console.log('\\nSample Unmapped:');
    sampleUnmapped.slice(0, 10).forEach(u => {
        console.log(\`- \${u.id}: [\${u.budget_code}] \${u.name} (\${u.funding_source})\`);
    });
}
`);
