import { findBudgetLineId } from './src/data/budgetData.js';

const testReq = {
    budget_code: '5.1.1',
    name: 'Financial Management for Development Professionals',
    funding_source: 'Comic Relief'
};

const result = findBudgetLineId(testReq);
console.log('Result for 5.1.1:', result);

const testReq2 = {
    budget_code: '4.2',
    name: 'Monitoring visit with Stewart in Sinazongwe',
    funding_source: 'Comic Relief'
};
const result2 = findBudgetLineId(testReq2);
console.log('Result for 4.2:', result2);
