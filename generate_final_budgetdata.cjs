/**
 * generate_final_budgetdata.cjs
 * Builds src/data/budgetData.js with exact data from ZGF_2026_SMART_Budget.xlsx
 */
const XLSX = require('xlsx');
const fs   = require('fs');
const path = require('path');

const wb = XLSX.readFile('./ZGF_2026_SMART_Budget.xlsx');

const SHEETS = [
  { name: 'Comic Relief', fsLabel: 'Comic Relief', prefix: 'CR', headerRow: 4 },
  { name: 'MOTTIII',      fsLabel: 'MOTTIII',       prefix: 'MT', headerRow: 5 },
  { name: 'KaluluII',     fsLabel: 'KaluluII',      prefix: 'KL', headerRow: 5 },
  { name: 'ZGF',          fsLabel: 'ZGF',            prefix: 'ZG', headerRow: 3 },
];

const allLines = [];
let globalIdx = 0;

SHEETS.forEach(({ name, fsLabel, prefix, headerRow }) => {
  const ws   = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const hdrs = data[headerRow];
  const col  = {};
  hdrs.forEach((h, i) => { if (h != null) col[String(h).trim()] = i; });

  const g = (row, ...keys) => {
    for (const k of keys) {
      if (col[k] !== undefined) {
        const v = row[col[k]];
        if (v !== null && v !== undefined && v !== '') return v;
      }
    }
    return null;
  };

  let lastPillar = null;
  let lastObj    = null;

  for (let r = headerRow + 1; r < data.length; r++) {
    const row = data[r];
    if (!row || row.every(v => v === null)) continue;

    const rawPillar = g(row, 'Strategic Pillar', 'Strategic Pillar ');
    const rawObj    = g(row, 'Objective', 'Objective ');
    if (rawPillar != null) lastPillar = String(rawPillar).trim();
    if (rawObj    != null) lastObj    = String(rawObj).trim();

    const activity  = g(row, 'Activities');
    const totalCost = g(row, 'Total Budget-ZMW', 'Total Cost');
    const zgfCode   = g(row, 'ZGF Code');
    const odooCode  = g(row, 'Odoo Code');
    const odooCat   = g(row, 'Odoo Category');
    const currency  = g(row, 'Currency') || 'ZMW';
    const q1 = g(row, 'Quarter1') || 0;
    const q2 = g(row, 'Quarter2') || 0;
    const q3 = g(row, 'Quarter3') || 0;
    const q4 = g(row, 'Quarter4') || 0;

    if (!activity || typeof activity !== 'string') continue;
    if (totalCost === null || Number(totalCost) === 0) continue;
    const act = String(activity).trim();
    if (/^total/i.test(act) || /^sub.?total/i.test(act)) continue;
    if (/^strategic pillar/i.test(act)) continue;

    globalIdx++;
    const seq = String(globalIdx).padStart(3, '0');

    allLines.push({
      id:             `${prefix}-${seq}`,
      fundingSource:  fsLabel,
      strategicPillar: lastPillar || '',
      objective:      lastObj || '',
      activity:       act,
      budgetCode:     zgfCode != null ? String(zgfCode).trim() : '',
      odooCode:       odooCode != null ? String(odooCode).trim() : '',
      odooCategory:   odooCat  != null ? String(odooCat).trim()  : '',
      currency:       String(currency).trim(),
      totalCost:      Number(totalCost),
      q1: Number(q1), q2: Number(q2), q3: Number(q3), q4: Number(q4),
      spent: 0,
    });
  }
});

// ── Compute totals ────────────────────────────────────────────────────────────
const summary = {};
allLines.forEach(l => {
  summary[l.fundingSource] = (summary[l.fundingSource] || 0) + l.totalCost;
});
const grandTotal = Object.values(summary).reduce((a,b)=>a+b, 0);

// ── Build JS lines string ─────────────────────────────────────────────────────
const jsLines = allLines.map(bl =>
  `    { id: '${bl.id}', fundingSource: '${bl.fundingSource}', ` +
  `strategicPillar: ${JSON.stringify(bl.strategicPillar)}, ` +
  `objective: ${JSON.stringify(bl.objective)}, ` +
  `activity: ${JSON.stringify(bl.activity)}, ` +
  `budgetCode: ${JSON.stringify(bl.budgetCode)}, ` +
  `odooCode: '${bl.odooCode}', ` +
  `odooCategory: ${JSON.stringify(bl.odooCategory)}, ` +
  `currency: '${bl.currency}', ` +
  `totalCost: ${bl.totalCost}, ` +
  `q1: ${bl.q1}, q2: ${bl.q2}, q3: ${bl.q3}, q4: ${bl.q4}, ` +
  `spent: 0 },`
).join('\n');

// ── Collect unique ZGF codes for mapping ──────────────────────────────────────
const fundingMap = {
  'Comic Relief': 'comic relief',
  'MOTTIII': 'mottiii',
  'KaluluII': 'kaluluii',
  'ZGF': 'zgf',
};

// ── Write the full budgetData.js ──────────────────────────────────────────────
const content = `// ZGF 2026 SMART Budget — Generated from ZGF_2026_SMART_Budget.xlsx
// Total lines: ${allLines.length}
// Total Annual Budget: ZMW ${grandTotal.toLocaleString('en-ZM', {maximumFractionDigits:2})}
// Sources: Comic Relief (K${(summary['Comic Relief']||0).toLocaleString('en-ZM',{maximumFractionDigits:2})}) + MOTTIII (K${(summary['MOTTIII']||0).toLocaleString('en-ZM',{maximumFractionDigits:2})}) + KaluluII (K${(summary['KaluluII']||0).toLocaleString('en-ZM',{maximumFractionDigits:2})}) + ZGF (K${(summary['ZGF']||0).toLocaleString('en-ZM',{maximumFractionDigits:2})})

export const FUNDING_SOURCES = ['All', 'Comic Relief', 'MOTTIII', 'KaluluII', 'ZGF'];

export const STRATEGIC_PILLARS = [
    'All',
    'Supporting CSOs',
    'Strengthening Communities',
    'Building the Field of Community Philanthropy',
    'Operations',
];

export const BUDGET_SUMMARY = {
    'Comic Relief': ${(summary['Comic Relief']||0).toFixed(2)},
    'MOTTIII': ${(summary['MOTTIII']||0).toFixed(2)},
    'KaluluII': ${(summary['KaluluII']||0).toFixed(2)},
    'ZGF': ${(summary['ZGF']||0).toFixed(2)},
    'Total': ${grandTotal.toFixed(2)},
};

export const CODE_GUIDE = {
    pillars: { 1: 'Supporting CSOs', 2: 'Strengthening Communities', 3: 'Building the Field of Community Philanthropy', 4: 'Overheads/Operations' },
    categories: { 1: 'Grants & Capacity Strengthening', 2: 'Training & Learning', 3: 'Community Engagement & Field Work', 4: 'Operations & Governance', 5: 'Philanthropy, Communications & Visibility', 6: 'Consultancy & Professional Services' },
};

// Exchange rates from Excel
export const EXCHANGE_RATES = {
    ZMW_USD: 25,
    ZMW_GBP: 30,
};

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET LINES  (${allLines.length} lines across 4 funding sources)
// ─────────────────────────────────────────────────────────────────────────────
export const budgetLines = [
${jsLines}
];

// Real payment requests mapped from Excel (overridden by SharePoint live sync if connected)
import parsedRequests from './seedPaymentRequests.js';

// Utility to match a payment request to a specific budget line ID
export const findBudgetLineId = (req) => {
    const code  = req.budget_code?.trim() || '';
    const name  = req.name?.toLowerCase() || '';
    let   fs    = req.funding_source?.toLowerCase() || '';

    // Normalise funding source variants from raw SharePoint data
    if (fs.includes('kalulu'))  fs = 'kaluluii';
    if (fs.includes('mott'))    fs = 'mottiii';
    if (fs === 'zgf ')          fs = 'zgf';
    if (fs === 'mott $')        fs = 'mottiii';
    if (fs === 'kalulu $')      fs = 'kaluluii';

    // 1. Exact match by ZGF code (budgetCode field) for the same funding source
    let match = budgetLines.find(bl =>
        bl.budgetCode === code && bl.fundingSource.toLowerCase() === fs
    );
    if (match) return match.id;

    // 2. Match by ZGF code across any funding source
    match = budgetLines.find(bl => bl.budgetCode === code);
    if (match) return match.id;

    // 3. Odoo code match for same funding source
    match = budgetLines.find(bl =>
        bl.odooCode === code && bl.fundingSource.toLowerCase() === fs
    );
    if (match) return match.id;

    // 4. Legacy code shortcuts (payment requests sometimes use old code scheme)
    const LEGACY = {
        '5.3.1': (f) => budgetLines.find(bl => bl.activity.includes('Staff') && bl.fundingSource.toLowerCase() === f),
        '4.8.4': (f) => budgetLines.find(bl => bl.budgetCode === '4.8.4' && bl.fundingSource.toLowerCase() === f),
        '1.1.7': ()  => budgetLines.find(bl => bl.activity.toLowerCase().includes('shifting') || bl.budgetCode === '3.7.5'),
        '5.1.1': (f) => budgetLines.find(bl => bl.odooCategory === 'Training & Learning' && bl.fundingSource.toLowerCase() === f),
        '5.1.2': (f) => budgetLines.find(bl => bl.odooCategory === 'Training & Learning' && bl.fundingSource.toLowerCase() === f),
        '2.5':   (f) => budgetLines.find(bl => bl.odooCategory?.includes('Communications') && bl.fundingSource.toLowerCase() === f),
        '4.2':   (f) => budgetLines.find(bl => (bl.objective?.includes('Board') || bl.objective?.includes('M&E') || bl.activity?.includes('visits')) && bl.fundingSource.toLowerCase() === f),
        '1.2':   (f) => budgetLines.find(bl => bl.objective?.includes('recruitment') && bl.fundingSource.toLowerCase() === f),
        '8.3':   (f) => budgetLines.find(bl => bl.strategicPillar === 'Operations' && bl.fundingSource.toLowerCase() === f),
        '13.2':  (f) => budgetLines.find(bl => bl.activity?.toLowerCase().includes('documentary') && bl.fundingSource.toLowerCase() === f),
    };

    if (LEGACY[code]) {
        const m = LEGACY[code](fs);
        if (m) return m.id;
    }

    // 5. Keyword fallback matching based on request name
    if (name.includes('staff time') || name.includes('net pay') || name.includes('napsa') || name.includes('nhima') || name.includes('paye')) {
        const m = budgetLines.find(bl => bl.activity.toLowerCase().includes('staff') && bl.fundingSource.toLowerCase() === fs);
        if (m) return m.id;
    }
    if (name.includes('grant disburs')) {
        const m = budgetLines.find(bl => bl.odooCategory === 'Grants & Capacity Strengthening' && bl.fundingSource.toLowerCase() === fs);
        if (m) return m.id;
    }
    if (name.includes('training') || name.includes('workshop') || name.includes('capacity')) {
        const m = budgetLines.find(bl => bl.odooCategory === 'Training & Learning' && bl.fundingSource.toLowerCase() === fs);
        if (m) return m.id;
    }
    if (name.includes('media') || name.includes('documentary') || name.includes('radio') || name.includes('visibility')) {
        const m = budgetLines.find(bl => bl.odooCategory?.includes('Communications') && bl.fundingSource.toLowerCase() === fs);
        if (m) return m.id;
    }
    if (name.includes('overhead') || name.includes('indirect')) {
        const m = budgetLines.find(bl => bl.odooCategory?.includes('Running') && bl.fundingSource.toLowerCase() === fs);
        if (m) return m.id;
    }

    // 6. Generic fallback — first budget line for funding source
    const fallback = budgetLines.find(bl => bl.fundingSource.toLowerCase() === fs);
    return fallback ? fallback.id : null;
};

export const samplePaymentRequests = parsedRequests.map((req, i) => ({
    id: req.id,
    sharepointId: parseInt(req.id.split('-')[1]) || i + 1,
    name: req.name,
    budgetCode: req.budget_code,
    budgetLineId: findBudgetLineId(req),
    year: req.year,
    amount: req.amount,
    requestedBy: req.requested_by,
    payee: req.payee,
    fundingSource: req.funding_source,
    status: req.status,
    date: req.date,
})).filter(req => req.year === 2026);

export function computeBudgetWithSpend(lines, requests) {
    const spentMap = {};
    (requests || []).forEach((req) => {
        if (req.status === 'Approved') {
            spentMap[req.budgetLineId] = (spentMap[req.budgetLineId] || 0) + req.amount;
        }
    });
    return lines.map((line) => ({
        ...line,
        spent: spentMap[line.id] || 0,
        remaining: line.totalCost - (spentMap[line.id] || 0),
    }));
}

export function formatZMW(amount) {
    if (amount == null || isNaN(amount)) return 'K 0';
    return new Intl.NumberFormat('en-ZM', {
        style: 'currency', currency: 'ZMW',
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
}

export function computeSummary(lines) {
    const totalBudget = lines.reduce((s, l) => s + (l.totalCost || 0), 0);
    const totalSpent  = lines.reduce((s, l) => s + (l.spent    || 0), 0);
    const remaining   = totalBudget - totalSpent;
    const pctUsed     = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    return { totalBudget, totalSpent, remaining, pctUsed };
}
`;

const outPath = path.join(__dirname, 'src', 'data', 'budgetData.js');
fs.writeFileSync(outPath, content, 'utf8');
console.log(`\nWrote ${allLines.length} budget lines to ${outPath}`);
console.log('Summary:', summary);
console.log('Grand Total: K', grandTotal.toLocaleString('en-ZM',{maximumFractionDigits:2}));
