import { samplePaymentRequests as data, budgetLines } from './src/data/budgetData.js';
const validLineIds = new Set(budgetLines.map(l => l.id));
const invalidList = [];
for (const r of data) {
    if (r.budgetLineId && !validLineIds.has(r.budgetLineId)) {
        invalidList.push({ id: r.id, bLineId: r.budgetLineId });
    }
}
console.log(`Total data: ${data.length}`);
console.log(`Mismatched validLineIds count: ${invalidList.length}`);
if (invalidList.length > 0) {
    console.log(invalidList.slice(0, 5));
}
