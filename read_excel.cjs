const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('./ZGF_2026_SMART_Budget.xlsx');

// Source sheets with their funding source names and header row indexes (0-based)
const SHEETS = [
  { name: 'Comic Relief', fundsSource: 'Comic Relief', headerRow: 4 },
  { name: 'MOTTIII',      fundsSource: 'Mott',          headerRow: 5 },
  { name: 'KaluluII',     fundsSource: 'Kalulu',         headerRow: 5 },
  { name: 'ZGF',          fundsSource: 'ZGF',            headerRow: 3 },
];

const budgetLines = [];

SHEETS.forEach(({ name, fundsSource, headerRow }) => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const headers = data[headerRow];

  console.log(`\n=== ${name} === Headers:`, JSON.stringify(headers));

  // Find column indices
  const col = {};
  headers.forEach((h, i) => {
    if (h) col[String(h).trim()] = i;
  });
  console.log('Column map:', JSON.stringify(col));

  for (let r = headerRow + 1; r < data.length; r++) {
    const row = data[r];
    if (!row || row.every(v => v === null)) continue;

    // Generic column finding helper
    const get = (...keys) => {
      for (const k of keys) {
        if (col[k] !== undefined && row[col[k]] !== null && row[col[k]] !== undefined) {
          return row[col[k]];
        }
      }
      return null;
    };

    const activity = get('Activities');
    const totalCost = get('Total Budget-ZMW', 'Total Cost');
    const zgfCode = get('ZGF Code');
    const strategicPillar = get('Strategic Pillar ');
    const objective = get('Objective ');
    const odooCode = get('Odoo Code');
    const odooCategory = get('Odoo Category');
    const q1 = get('Quarter1');
    const q2 = get('Quarter2');
    const q3 = get('Quarter3');
    const q4 = get('Quarter4');
    const currency = get('Currency') || 'ZMW';

    if (!activity || !totalCost) continue;
    if (totalCost === 0) continue;

    budgetLines.push({
      funding_source: fundsSource,
      strategic_pillar: strategicPillar,
      objective,
      activity,
      budget_code: zgfCode,
      odoo_code: odooCode,
      odoo_category: odooCategory,
      currency,
      total_cost: totalCost,
      q1: q1 || 0,
      q2: q2 || 0,
      q3: q3 || 0,
      q4: q4 || 0,
    });
  }
});

console.log(`\nTotal budget lines: ${budgetLines.length}`);
fs.writeFileSync('./budget_lines_extracted.json', JSON.stringify(budgetLines, null, 2), 'utf8');
console.log('Saved to budget_lines_extracted.json');
