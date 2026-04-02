/**
 * sync_payment_requests_csv.cjs
 * Parses approved_requests_2026_updated.csv and:
 * 1. Writes src/data/seedPaymentRequests.js
 * 2. Upserts into Supabase payment_requests table
 */
const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ── Read env ─────────────────────────────────────────────────────────────────
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const getEnv = (k) => {
  const m = envContent.match(new RegExp(`^${k}=(.*)$`, 'm'));
  return m ? m[1].replace('\r','').trim() : null;
};
const SUPABASE_URL    = getEnv('VITE_SUPABASE_URL');
const SUPABASE_SECRET = getEnv('VITE_SUPABASE_SECRETE_KEY');
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);

// ── Budget lines (loaded to resolve IDs) ─────────────────────────────────────
// We load the generated JSON for mapping
const budgetLinesRaw = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'budget_lines_final.json'), 'utf8')
);

// ── Amount parser ─────────────────────────────────────────────────────────────
// CSV amounts are messy: "$449", "K13,050.00", "GBP 76.5, ZMW 62.31",
// "USD500, ZMW1000", "850 USD /2100 ZWM", "k42,608.69", "ZAR2906, GBP76.50"
// Strategy: extract the ZMW/K value first, else fallback to first numeric value
// (convert foreign currencies approximately: USD*25, GBP*30, GH*1.6)
const RATE = { USD: 25, GBP: 30, ZAR: 1.35, GH: 1.6 };

function parseAmount(raw) {
  if (!raw || raw.toString().trim() === '') return 0;
  const s = raw.toString().trim();

  // Multi-currency: "USD500, ZMW1000" — prefer ZMW part
  const zmwMatch = s.match(/(?:ZMW|K|k)\s*([\d,]+(?:\.\d+)?)/i);
  if (zmwMatch) return parseFloat(zmwMatch[1].replace(/,/g, ''));

  // Pure ZMW / K prefix: "K13,050.00", "k700", "k42,608.69"
  const kMatch = s.match(/^[kK]\s*([\d,]+(?:\.\d+)?)/);
  if (kMatch) return parseFloat(kMatch[1].replace(/,/g, ''));

  // Plain number (possibly with commas): "5,147.45", "482,909"
  const plainMatch = s.replace(/\s/g, '').match(/^[\d,]+(?:\.\d+)?$/);
  if (plainMatch) return parseFloat(s.replace(/,/g, ''));

  // "$449", "$668.16" — USD
  const usdMatch = s.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  if (usdMatch) return parseFloat(usdMatch[1].replace(/,/g, '')) * RATE.USD;

  // "GBP75000", "GBP76.5"
  const gbpMatch = s.match(/GBP\s*([\d,]+(?:\.\d+)?)/i);
  if (gbpMatch) return parseFloat(gbpMatch[1].replace(/,/g, '')) * RATE.GBP;

  // "GH65000"
  const ghMatch = s.match(/GH\s*([\d,]+(?:\.\d+)?)/i);
  if (ghMatch) return parseFloat(ghMatch[1].replace(/,/g, '')) * RATE.GH;

  // "$30,000" within longer string — already handled above
  // "850 USD /2100 ZWM" — prefer ZWM but fallback to USD
  const zwmMatch = s.match(/([\d,]+(?:\.\d+)?)\s*(?:ZWM|ZMW)/i);
  if (zwmMatch) return parseFloat(zwmMatch[1].replace(/,/g, ''));
  const usdInline = s.match(/([\d,]+(?:\.\d+)?)\s*USD/i);
  if (usdInline) return parseFloat(usdInline[1].replace(/,/g, '')) * RATE.USD;

  // Last resort: grab first number
  const anyNum = s.replace(/,/g, '').match(/[\d]+(?:\.\d+)?/);
  if (anyNum) return parseFloat(anyNum[0]);

  return 0;
}

// ── Funding source normaliser ─────────────────────────────────────────────────
function normaliseFundingSource(raw) {
  if (!raw) return 'Comic Relief';
  const s = raw.trim();
  if (/mott\s*\$/i.test(s))   return 'MOTTIII';
  if (/kalulu\s*\$/i.test(s)) return 'KaluluII';
  if (/mott/i.test(s))        return 'MOTTIII';
  if (/kalulu/i.test(s))      return 'KaluluII';
  if (/zgf/i.test(s))         return 'ZGF';
  if (/loop/i.test(s))        return 'Comic Relief'; // internal transfer via LOOP
  if (/sharetrust/i.test(s))  return 'KaluluII';     // Sharetrust -> Kalulu project
  if (/comic/i.test(s))       return 'Comic Relief';
  // Multi-source, e.g. "Comic Relief;#Mott"
  if (s.includes(';')) return normaliseFundingSource(s.split(';')[0]);
  return s;
}

// ── Budget line ID lookup ─────────────────────────────────────────────────────
function findBudgetLineId(code, fundingSource, name) {
  // budget_lines_final.json uses camelCase fields
  const fsNorm = fundingSource.toLowerCase().replace(/\s+/g,'');
  const bl = budgetLinesRaw;

  // Helper to match funding source
  const fsMatch = (l) => l.fundingSource.toLowerCase().replace(/\s+/g,'') === fsNorm;

  // 1. Exact ZGF code + funding source
  let m = bl.find(l => l.budgetCode === code && fsMatch(l));
  if (m) return m.id;

  // 2. ZGF code any source
  m = bl.find(l => l.budgetCode === code);
  if (m) return m.id;

  // 3. Keyword-based fallback
  const nameLower = (name||'').toLowerCase();
  if (nameLower.includes('staff time') || nameLower.includes('net pay') || nameLower.includes('napsa') || nameLower.includes('nhima') || nameLower.includes('paye') || nameLower.includes('carecoop') || nameLower.includes('helsb') || nameLower.includes('gratuity') || nameLower.includes('loans deduction')) {
    m = bl.find(l => l.activity.toLowerCase().includes('staff') && fsMatch(l));
    if (m) return m.id;
    m = bl.find(l => fsMatch(l));
    if (m) return m.id;
  }
  if (nameLower.includes('disburs') || (nameLower.includes('grant') && !nameLower.includes('committee'))) {
    m = bl.find(l => l.odooCategory === 'Grants & Capacity Strengthening' && fsMatch(l));
    if (m) return m.id;
  }
  if (nameLower.includes('training') || nameLower.includes('workshop') || nameLower.includes('capacity building')) {
    m = bl.find(l => l.odooCategory === 'Training & Learning' && fsMatch(l));
    if (m) return m.id;
  }
  if (nameLower.includes('media') || nameLower.includes('debate') || nameLower.includes('documentary') || nameLower.includes('radio')) {
    m = bl.find(l => l.odooCategory && l.odooCategory.includes('Communications') && fsMatch(l));
    if (m) return m.id;
  }

  // 4. First line for this funding source
  m = bl.find(l => fsMatch(l));
  return m ? m.id : null;
}

// ── Parse CSV ─────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.split('\n').map(l => l.replace('\r',''));
  const headers = lines[0].split(',');

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted fields
    const cols = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur);

    const row = {};
    headers.forEach((h, idx) => { row[h.trim()] = (cols[idx]||'').trim(); });
    records.push(row);
  }
  return records;
}

const csvText  = fs.readFileSync('./approved_requests_2026_updated.csv', 'utf8');
const rawRows  = parseCSV(csvText).filter(r => r['ID'] && r['ID'].match(/^\d+$/));

console.log(`Parsed ${rawRows.length} records from CSV`);

// ── Build payment request objects ─────────────────────────────────────────────
const requests = rawRows.map(r => {
  const id           = `PR-${r['ID']}`;
  const name         = (r['Activity/Purpose'] || '').trim();
  const requestedBy  = (r['Requested by.'] || '').trim();
  const budgetCode   = (r['Budget Code.'] || '').trim().replace(/\s+/g,'');
  const rawFS        = (r['Funding source'] || '').trim();
  const fundingSource = normaliseFundingSource(rawFS);
  const amount       = parseAmount(r['Total']);
  const payee        = (r['Payee'] || '').trim();
  const status       = (r['Approval status'] || 'Approved').trim();
  const yearRaw      = r['Year'] || '2026';
  const year         = parseInt(yearRaw) || 2026;
  const budgetLineId = findBudgetLineId(budgetCode, fundingSource, name);

  return {
    id, name, requested_by: requestedBy,
    budget_code: budgetCode || null,
    funding_source: fundingSource,
    amount, payee, status, year,
    budget_line_id: budgetLineId,
    date: '2026-01-01',
  };
});

console.log(`Built ${requests.length} payment request objects`);

// Sample check
requests.slice(0,5).forEach(r =>
  console.log(`  ${r.id}: "${r.name.substring(0,40)}" K${r.amount} [${r.funding_source}] → ${r.budget_line_id}`)
);

// ── Write seedPaymentRequests.js ──────────────────────────────────────────────
const jsObjects = requests.map(r =>
  `  {\n` +
  `    "id": ${JSON.stringify(r.id)},\n` +
  `    "name": ${JSON.stringify(r.name)},\n` +
  `    "requested_by": ${JSON.stringify(r.requested_by)},\n` +
  `    "budget_code": ${JSON.stringify(r.budget_code)},\n` +
  `    "funding_source": ${JSON.stringify(r.funding_source)},\n` +
  `    "amount": ${r.amount},\n` +
  `    "payee": ${JSON.stringify(r.payee)},\n` +
  `    "status": ${JSON.stringify(r.status)},\n` +
  `    "year": ${r.year},\n` +
  `    "date": "2026"\n` +
  `  }`
).join(',\n');

const seedContent = `export default [\n${jsObjects}\n];\n`;
fs.writeFileSync('./src/data/seedPaymentRequests.js', seedContent, 'utf8');
console.log(`\n✓ Wrote ${requests.length} records to src/data/seedPaymentRequests.js`);

// ── Sync to Supabase ──────────────────────────────────────────────────────────
async function syncToSupabase() {
  console.log(`\nSyncing to Supabase...`);

  // Clear existing 2026 payment requests
  const { error: delErr } = await supabase
    .from('payment_requests')
    .delete()
    .eq('year', 2026);

  if (delErr) {
    console.error('Delete error:', delErr.message);
  } else {
    console.log('✓ Cleared existing 2026 payment requests');
  }

  // Prepare Supabase rows (snake_case for DB)
  const rows = requests.map(r => ({
    id:             r.id,
    name:           r.name,
    requested_by:   r.requested_by,
    budget_code:    r.budget_code || null,
    budget_line_id: r.budget_line_id || null,
    funding_source: r.funding_source,
    amount:         r.amount,
    status:         r.status,
    year:           r.year,
    date:           r.date,
    synced_at:      new Date().toISOString(),
  }));

  // Insert in batches of 50
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('payment_requests').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Batch ${Math.floor(i/BATCH)+1} error:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`  ✓ Batch ${Math.floor(i/BATCH)+1}: ${batch.length} records (${inserted}/${rows.length})`);
    }
  }

  // Verify
  const { count } = await supabase
    .from('payment_requests')
    .select('*', { count: 'exact', head: true })
    .eq('year', 2026);

  console.log(`\n✅ Done! payment_requests table now has ${count} records for 2026.`);

  // Summary by funding source
  const byFS = {};
  requests.forEach(r => {
    byFS[r.funding_source] = byFS[r.funding_source] || { count: 0, total: 0 };
    byFS[r.funding_source].count++;
    byFS[r.funding_source].total += r.amount;
  });
  console.log('\nSummary by funding source:');
  Object.entries(byFS).forEach(([fs, d]) =>
    console.log(`  ${fs}: ${d.count} requests, K ${d.total.toLocaleString('en-ZM', {maximumFractionDigits:2})}`)
  );
}

syncToSupabase().catch(e => { console.error(e); process.exit(1); });
