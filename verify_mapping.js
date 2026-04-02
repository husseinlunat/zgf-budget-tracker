import parsedRequests from './src/data/seedPaymentRequests.js';
import { budgetLines, findBudgetLineId } from './src/data/budgetData.js';

const mapped = [];
const unmapped = [];

parsedRequests.forEach(req => {
    const lineId = findBudgetLineId(req);
    if (lineId) {
        mapped.push({ id: req.id, code: req.budget_code, lineId });
    } else {
        unmapped.push({ id: req.id, code: row.budget_code, name: req.name, fs: req.funding_source });
    }
});

console.log(`Summary:`);
console.log(`Total Requests: ${parsedRequests.length}`);
console.log(`Successfully Mapped: ${mapped.length}`);
console.log(`Unmapped: ${unmapped.length}`);

if (unmapped.length > 0) {
    console.log(`\nSample Unmapped (First 10):`);
    unmapped.slice(0, 10).forEach(u => console.log(`- ${u.id}: [${u.code}] ${u.name} (${u.fs})`));
}
