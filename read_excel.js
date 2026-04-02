const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('./ZGF_2026_SMART_Budget.xlsx');
console.log('Sheets:', wb.SheetNames);

wb.SheetNames.forEach(sn => {
  const ws = wb.Sheets[sn];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  console.log(`\n========== Sheet: ${sn} ==========`);
  console.log(`Rows: ${data.length}`);
  // Print first 15 rows
  data.slice(0, 15).forEach((row, i) => {
    console.log(`Row ${i+1}:`, JSON.stringify(row));
  });
});
