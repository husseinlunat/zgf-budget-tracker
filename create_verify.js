import fs from 'fs';

// Helper to extract content between markers
function extractArray(content, varName) {
    const regex = new RegExp(`export const ${varName} = ([\\s\\S]*?);`, 'm');
    const match = content.match(regex);
    if (!match) return null;
    return match[1];
}

// Since we can't easily eval JS with imports in a simple script, 
// I'll create a clean ESM test script.

const testScript = `
import { budgetLines } from './src/data/budgetData.js';
import parsedRequests from './src/data/seedPaymentRequests.js';

// Re-implement mapping logic locally for verification if needed, 
// but budgetData.js already does it in samplePaymentRequests if it's exported.
// Since samplePaymentRequests IS exported, we can just check it.

import { samplePaymentRequests } from './src/data/budgetData.js';

console.log('--- MAPPING VERIFICATION ---');
console.log('Total Requests in Seed:', parsedRequests.length);
console.log('Total Mapped in samplePaymentRequests:', samplePaymentRequests.length);

const unmapped = parsedRequests.filter(pr => !samplePaymentRequests.some(sr => sr.id === pr.id));
console.log('Unmapped Count:', unmapped.length);

if (unmapped.length > 0) {
    console.log('\\nTop Unmapped Codes:');
    const counts = {};
    unmapped.forEach(u => {
        counts[u.budget_code] = (counts[u.budget_code] || 0) + 1;
    });
    console.log(Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 10));
}

// Check Aggregate Spend
const totalSpent = samplePaymentRequests.reduce((s, r) => s + (r.status === 'Approved' ? r.amount : 0), 0);
console.log('\\nTotal Spent (Mapped & Approved):', totalSpent.toLocaleString());

const budgetLineSpend = {};
samplePaymentRequests.forEach(r => {
    if (r.status === 'Approved') {
        budgetLineSpend[r.budgetLineId] = (budgetLineSpend[r.budgetLineId] || 0) + r.amount;
    }
});

console.log('\\nBudget Line Spend Breakdown (Top 5):');
console.log(Object.entries(budgetLineSpend).sort((a,b) => b[1] - a[1]).slice(0, 5));
`;

fs.writeFileSync('verify_final.mjs', testScript);
console.log('Created verify_final.mjs');
