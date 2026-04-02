import fs from 'fs';
import path from 'path';

function parseAmount(val) {
  if (!val) return 0;
  // Remove currency prefixes ($ or K or GBP) and commas
  const clean = val.toString().replace(/[$,K\s]/g, '').replace(/,/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

const csvPath = 'approved_requests_2026_updated.csv';
const content = fs.readFileSync(csvPath, 'utf8');

const rows = content.split('\n').filter(line => line.trim());

const parsed = rows.slice(1).map(row => {
    // Robust CSV split for quoted strings
    const parts = [];
    let currentPart = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            parts.push(currentPart.trim());
            currentPart = '';
        } else {
            currentPart += char;
        }
    }
    parts.push(currentPart.trim());

    if (parts.length < 8) return null;
    
    // Clean quotes
    const clean = parts.map(p => p.replace(/^"|"$/g, '').trim());
    
    return {
        id: `PR-${clean[0]}`,
        name: clean[1],
        requested_by: clean[2],
        budget_code: clean[3],
        funding_source: clean[4],
        amount: parseAmount(clean[5]),
        payee: clean[6],
        status: clean[7],
        year: 2026,
        date: clean[8] ? clean[8].replace('.0', '').trim() : '2026-01-01'
    };
}).filter(Boolean);

const output = `export default ${JSON.stringify(parsed, null, 2)};`;
fs.writeFileSync('src/data/seedPaymentRequests.js', output);
console.log(`Successfully parsed ${parsed.length} records into seedPaymentRequests.js`);
