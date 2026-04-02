/**
 * generate_budget_data.cjs
 * Reads ZGF_2026_SMART_Budget.xlsx and emits:
 *   - src/data/budgetLines.generated.json  (for inspection)
 *   - console output of the final budgetData.js budgetLines array
 */
const XLSX = require('xlsx');
const fs   = require('fs');

const wb = XLSX.readFile('./ZGF_2026_SMART_Budget.xlsx');

// ── Sheet config ────────────────────────────────────────────────────────────
// headerRow = 0-based index of the row containing column headers
const SHEETS = [
  { name: 'Comic Relief', fsLabel: 'Comic Relief', prefix: 'CR', headerRow: 4 },
  { name: 'MOTTIII',      fsLabel: 'MOTTIII',       prefix: 'MT', headerRow: 5 },
  { name: 'KaluluII',     fsLabel: 'KaluluII',      prefix: 'KL', headerRow: 5 },
  { name: 'ZGF',          fsLabel: 'ZGF',            prefix: 'ZG', headerRow: 3 },
];

// ── ZGF-code → budget_code mapping for payment request linking ──────────────
// Budget codes used in payment requests (from seedPaymentRequests.js)
// We keep the ZGF code as the canonical code in budgetLines

const allLines = [];
let globalIdx = 0;

SHEETS.forEach(({ name, fsLabel, prefix, headerRow }) => {
  const ws   = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const hdrs = data[headerRow];

  // Build column index map (trim whitespace from header names)
  const col = {};
  hdrs.forEach((h, i) => { if (h != null) col[String(h).trim()] = i; });

  // Helper: get first non-null value from candidate column names
  const g = (row, ...keys) => {
    for (const k of keys) {
      if (col[k] !== undefined) {
        const v = row[col[k]];
        if (v !== null && v !== undefined && v !== '') return v;
      }
    }
    return null;
  };

  // Track the last non-null strategic pillar & objective for merged cells
  let lastPillar    = null;
  let lastObjective = null;

  for (let r = headerRow + 1; r < data.length; r++) {
    const row = data[r];
    if (!row || row.every(v => v === null)) continue;

    // Inherit merged-cell values
    const rawPillar    = g(row, 'Strategic Pillar ');
    const rawObjective = g(row, 'Objective ');
    if (rawPillar    != null) lastPillar    = String(rawPillar).trim();
    if (rawObjective != null) lastObjective = String(rawObjective).trim();

    const activity  = g(row, 'Activities');
    const totalCost = g(row, 'Total Budget-ZMW', 'Total Cost', 'Total Budget-ZM');
    const zgfCode   = g(row, 'ZGF Code');
    const odooCode  = g(row, 'Odoo Code');
    const odooCategory = g(row, 'Odoo Category');
    const currency  = g(row, 'Currency') || 'ZMW';
    const q1 = g(row, 'Quarter1') || 0;
    const q2 = g(row, 'Quarter2') || 0;
    const q3 = g(row, 'Quarter3') || 0;
    const q4 = g(row, 'Quarter4') || 0;

    // Skip totals rows, header echo-rows, or rows without activity or cost
    if (!activity || typeof activity !== 'string') continue;
    if (totalCost === null || totalCost === 0) continue;
    if (activity.toUpperCase().startsWith('TOTAL') || activity.toUpperCase().startsWith('SUB-TOTAL')) continue;
    if (String(activity).trim().startsWith('Strategic Pillar')) continue;

    globalIdx++;
    const seq = String(globalIdx).padStart(3, '0');

    allLines.push({
      id:             `${prefix}-${seq}`,
      fundingSource:  fsLabel,
      strategicPillar: lastPillar  || '',
      objective:      lastObjective || '',
      activity:       String(activity).trim(),
      budgetCode:     zgfCode != null ? String(zgfCode).trim() : '',
      odooCode:       odooCode != null ? String(odooCode).trim() : '',
      odooCategory:   odooCategory != null ? String(odooCategory).trim() : '',
      currency:       String(currency).trim(),
      totalCost:      Number(totalCost),
      q1: Number(q1),
      q2: Number(q2),
      q3: Number(q3),
      q4: Number(q4),
      spent: 0,
    });
  }
});

// ── Save JSON for inspection ─────────────────────────────────────────────────
fs.writeFileSync('./budget_lines_final.json', JSON.stringify(allLines, null, 2), 'utf8');
console.log(`Extracted ${allLines.length} budget lines → budget_lines_final.json`);

// ── Emit JS array ────────────────────────────────────────────────────────────
const lines = allLines.map(bl => {
  return `    { id: '${bl.id}', fundingSource: '${bl.fundingSource}', strategicPillar: ${JSON.stringify(bl.strategicPillar)}, objective: ${JSON.stringify(bl.objective)}, activity: ${JSON.stringify(bl.activity)}, budgetCode: ${JSON.stringify(bl.budgetCode)}, odooCode: '${bl.odooCode}', odooCategory: ${JSON.stringify(bl.odooCategory)}, currency: '${bl.currency}', totalCost: ${bl.totalCost}, q1: ${bl.q1}, q2: ${bl.q2}, q3: ${bl.q3}, q4: ${bl.q4}, spent: 0 },`;
}).join('\n');

fs.writeFileSync('./budget_lines_array.txt', `export const budgetLines = [\n${lines}\n];\n`, 'utf8');
console.log('Emitted budget_lines_array.txt');

// Print summary by funding source
const summary = {};
allLines.forEach(l => {
  summary[l.fundingSource] = (summary[l.fundingSource] || 0) + l.totalCost;
});
console.log('\nSummary by funding source:');
Object.entries(summary).forEach(([fs, total]) => {
  console.log(`  ${fs}: K ${total.toLocaleString('en-ZM', {maximumFractionDigits:2})}`);
});
const grandTotal = Object.values(summary).reduce((a,b) => a+b, 0);
console.log(`  TOTAL: K ${grandTotal.toLocaleString('en-ZM', {maximumFractionDigits:2})}`);
