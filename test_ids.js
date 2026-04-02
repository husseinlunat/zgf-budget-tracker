import { budgetLines } from './src/data/budgetData.js';
console.log('Total Budget Lines:', budgetLines.length);
const ids = budgetLines.map(l => l.id);
console.log('First 5 IDs:', ids.slice(0, 5));
console.log('Last 5 IDs:', ids.slice(-5));
console.log('CR-054 exists?', ids.includes('CR-054'));
console.log('CR-054 index:', ids.indexOf('CR-054'));
if (ids.indexOf('CR-054') !== -1) {
    const item = budgetLines[ids.indexOf('CR-054')];
    console.log('Item:', item);
}
