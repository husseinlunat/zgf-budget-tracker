/**
 * sync_budget_lines.cjs
 * Reads ZGF_2026_SMART_Budget.xlsx and upserts budget_lines to Supabase.
 * Run: node sync_budget_lines.cjs
 */
const XLSX   = require('xlsx');
const fs     = require('fs');
const path   = require('path');
const { createClient } = require('@supabase/supabase-js');

// ── Read env ─────────────────────────────────────────────────────────────────
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const getEnv = (k) => {
  const m = envContent.match(new RegExp(`^${k}=(.*)$`, 'm'));
  return m ? m[1].replace('\r','').trim() : null;
};
const SUPABASE_URL    = getEnv('VITE_SUPABASE_URL');
const SUPABASE_SECRET = getEnv('VITE_SUPABASE_SECRETE_KEY');

if (!SUPABASE_URL || !SUPABASE_SECRET) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SECRETE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET);

// ── Parse Excel ───────────────────────────────────────────────────────────────
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
    const q1 = Number(g(row, 'Quarter1') || 0);
    const q2 = Number(g(row, 'Quarter2') || 0);
    const q3 = Number(g(row, 'Quarter3') || 0);
    const q4 = Number(g(row, 'Quarter4') || 0);

    if (!activity || typeof activity !== 'string') continue;
    if (totalCost === null || Number(totalCost) === 0) continue;
    const act = String(activity).trim();
    if (/^total/i.test(act) || /^sub.?total/i.test(act)) continue;
    if (/^strategic pillar/i.test(act)) continue;

    globalIdx++;
    const seq = String(globalIdx).padStart(3, '0');

    allLines.push({
      id:               `${prefix}-${seq}`,
      funding_source:   fsLabel,
      strategic_pillar: lastPillar || '',
      objective:        lastObj || '',
      activity:         act,
      budget_code:      zgfCode != null ? String(zgfCode).trim() : null,
      odoo_code:        odooCode != null ? String(odooCode).trim() : null,
      odoo_category:    odooCat  != null ? String(odooCat).trim()  : null,
      zgf_code:         zgfCode != null ? String(zgfCode).trim() : null,
      currency:         String(currency).trim(),
      total_cost:       Number(totalCost),
      q1, q2, q3, q4,
      spent: 0,
    });
  }
});

console.log(`\nParsed ${allLines.length} budget lines from Excel.`);

// ── Sync to Supabase ──────────────────────────────────────────────────────────
async function sync() {
  console.log(`\nConnecting to Supabase: ${SUPABASE_URL}`);

  // 1. Clear existing budget lines
  const { error: delError } = await supabase
    .from('budget_lines')
    .delete()
    .neq('id', 'DUMMY_THAT_WONT_MATCH'); // delete all

  if (delError) {
    console.error('Error clearing budget_lines:', delError.message);
    // Continue anyway — upsert will handle duplicates
  } else {
    console.log('✓ Cleared existing budget_lines.');
  }

  // 2. Insert in batches of 50
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < allLines.length; i += batchSize) {
    const batch = allLines.slice(i, i + batchSize);
    const { error: insError } = await supabase
      .from('budget_lines')
      .upsert(batch, { onConflict: 'id' });

    if (insError) {
      console.error(`Error inserting batch starting at ${i}:`, insError.message);
    } else {
      inserted += batch.length;
      console.log(`✓ Upserted ${batch.length} lines (${inserted}/${allLines.length} total)`);
    }
  }

  // 3. Verify
  const { count, error: cntError } = await supabase
    .from('budget_lines')
    .select('*', { count: 'exact', head: true });

  if (!cntError) {
    console.log(`\n✅ Done! budget_lines table now has ${count} records.`);
  }

  // Print summary
  const summary = {};
  allLines.forEach(l => {
    summary[l.funding_source] = (summary[l.funding_source] || 0) + l.total_cost;
  });
  console.log('\nBudget summary:');
  Object.entries(summary).forEach(([fs, tot]) => {
    console.log(`  ${fs}: K ${tot.toLocaleString('en-ZM', {maximumFractionDigits:2})}`);
  });
  const grand = Object.values(summary).reduce((a,b)=>a+b,0);
  console.log(`  TOTAL: K ${grand.toLocaleString('en-ZM', {maximumFractionDigits:2})}`);
}

sync().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
