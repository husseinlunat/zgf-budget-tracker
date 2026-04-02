import { samplePaymentRequests as reqs } from './src/data/budgetData.js';

console.log('Total reqs:', reqs.length);
const nulls = reqs.filter(r => !r.budgetLineId);
console.log('Total NULL budgetLineId:', nulls.length);
if (nulls.length > 0) {
    console.log('Sample NULL req:', nulls[0]);
}

const mtFallback = reqs.filter(r => r.budgetLineId === 'MT-005');
console.log('MT-005 assigned:', mtFallback.length);
