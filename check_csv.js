import fs from 'fs';

const content = fs.readFileSync('approved_requests_2026_updated.csv', 'utf8').trim();
const rows = content.split('\n').filter(line => line.trim());

console.log('--- CSV Analysis ---');
rows.slice(1).forEach((row, i) => {
    // Regex to handle quoted CSV fields
    const regex = /(".*?"|[^",\s][^",]*[^",\s]|[^",\s]|(?<=,|^)(?=,|$))/g;
    const parts = row.match(regex).map(p => p.replace(/^"|"$/g, '').trim());

    if (!parts || parts.length < 6) {
        console.log(`Row ${i+2}: FAILED SPLIT (len=${parts?.length})`);
        return;
    }

    const raw = parts[5];
    const clean = raw.replace(/[$,Kk\s]/g, '').replace(/,/g, '');
    const num = parseFloat(clean);

    if (isNaN(num) || num <= 0) {
        console.log(`Row ${i+2}: ID=${parts[0]} Raw='${raw}' Clean='${clean}' Num=${num}`);
    }
});
