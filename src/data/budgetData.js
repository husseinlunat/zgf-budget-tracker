// ZGF 2026 SMART Budget — COMPLETE Seed Data (all sheets)
// Total Annual Budget: ZMW 68,540,561.96
// Sources: Comic Relief (K60.66M) + MOTTIII (K3.50M) + KaluluII (K3.23M) + ZGF (K1.10M)

export const FUNDING_SOURCES = ['All', 'Comic Relief', 'MOTTIII', 'KaluluII', 'ZGF'];

export const STRATEGIC_PILLARS = [
    'All',
    'Supporting CSOs',
    'Strengthening Communities',
    'Building the Field of Community Philanthropy',
    'Operations',
];

export const BUDGET_SUMMARY = {
    'Comic Relief': 60662504.88,
    'MOTTIII': 3504858.00,
    'KaluluII': 3226199.08,
    'ZGF': 1104500.00,
    'Total': 68540561.96,
};

export const CODE_GUIDE = {
    pillars: { 1: 'Supporting CSOs', 2: 'Strengthening Communities', 3: 'Building the Field of Community Philanthropy', 4: 'Overheads/Operations' },
    categories: { 1: 'Grants & Capacity Strengthening', 2: 'Training & Learning', 3: 'Community Engagement & Field Work', 4: 'Operations & Governance', 5: 'Philanthropy, Communications & Visibility', 6: 'Consultancy & Professional Services' },
};

// ─────────────────────────────────────────────────────────────────────────────
// BUDGET LINES  (64 lines across 4 funding sources)
// ─────────────────────────────────────────────────────────────────────────────
export const budgetLines = [

    // ═══════════════════════════════════════════════════════════════════════════
    // COMIC RELIEF  (53 lines — Total K60,662,504.88)
    // ═══════════════════════════════════════════════════════════════════════════

    // Supporting CSOs — Objective 1: CSSF Grant Disbursements
    { id: 'CR-001', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 1: CSSF Grant Disbursements', activity: "Disbursement to 20 CSO's - March 2026", budgetCode: '4000-010-004', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.1.1', currency: 'ZMW', totalCost: 15000000, q1: 15000000, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-002', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 1: CSSF Grant Disbursements', activity: "Disbursement to 7 CSO's - October 2026", budgetCode: '4000-010-004', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.1.1', currency: 'ZMW', totalCost: 5250000, q1: 0, q2: 0, q3: 5250000, q4: 0, spent: 0 },
    { id: 'CR-003', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 1: CSSF Grant Disbursements', activity: "Disbursement to 11 CSO's - November 2026", budgetCode: '4000-010-004', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.1.1', currency: 'ZMW', totalCost: 8800000, q1: 0, q2: 0, q3: 0, q4: 8800000, spent: 0 },

    // Supporting CSOs — Objective 1: Capacity Strengthening
    { id: 'CR-004', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 1: Capacity Strengthening', activity: 'Introductory workshop for 38 CSO partners', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '1.1.2', currency: 'ZMW', totalCost: 708940, q1: 708940, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-005', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 1: Capacity Strengthening', activity: 'Familiarisation visits to CSSF II & III CSOs', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '1.1.2', currency: 'ZMW', totalCost: 515060, q1: 515060, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-006', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 1: Capacity Strengthening', activity: 'CSO demand-based capacity strengthening support', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '1.2.2', currency: 'ZMW', totalCost: 4845000, q1: 807500, q2: 1816875, q3: 1816875, q4: 403750, spent: 0 },
    { id: 'CR-007', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 1: Capacity Strengthening', activity: 'Quality assurance & capacity strengthening visits', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '1.2.3', currency: 'ZMW', totalCost: 2056495.84, q1: 373908.33, q2: 747816.67, q3: 747816.67, q4: 186954.17, spent: 0 },
    { id: 'CR-008', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 1: Capacity Strengthening', activity: 'Quarterly review of 38 financial & narrative reports', budgetCode: '4000-010-004', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.3.1', currency: 'ZMW', totalCost: 4000, q1: 1000, q2: 1000, q3: 1000, q4: 1000, spent: 0 },
    { id: 'CR-009', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 2: Mandatory OS Trainings', activity: 'Biannual mandatory OS trainings (M&E, Financial Mgmt)', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '1.2.2', currency: 'ZMW', totalCost: 1503524, q1: 0, q2: 751762, q3: 751762, q4: 0, spent: 0 },
    { id: 'CR-010', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 2: Tailored OS Support', activity: 'Tailored OS support for 17 CF CSO partners', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '1.2.3', currency: 'ZMW', totalCost: 1490156.25, q1: 270937.50, q2: 541875, q3: 541875, q4: 135468.75, spent: 0 },
    { id: 'CR-011', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 2: OS Review', activity: 'Biannual tailored OS support review & OD assessment', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '1.2.3', currency: 'ZMW', totalCost: 446476, q1: 0, q2: 223238, q3: 0, q4: 223238, spent: 0 },
    { id: 'CR-012', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 3: CRMF Launch', activity: 'Launch of CRMF programme', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.4.1', currency: 'ZMW', totalCost: 500000, q1: 0, q2: 0, q3: 0, q4: 500000, spent: 0 },
    { id: 'CR-013', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 3: ZGF Institutional OS', activity: 'ZGF Institutional OS strengthening', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.5.1', currency: 'ZMW', totalCost: 2203540, q1: 367256.67, q2: 734513.33, q3: 918141.67, q4: 183628.33, spent: 0 },
    { id: 'CR-014', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 3: Planning', activity: '2027 Planning & Budgeting - Q4 2026', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '1.5.1', currency: 'ZMW', totalCost: 669700, q1: 0, q2: 0, q3: 0, q4: 669700, spent: 0 },

    // Supporting CSOs — Objective 4: Employee Engagement
    { id: 'CR-015', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 4: Employee Engagement', activity: 'Team Building - Q1 2026', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '1.5.2', currency: 'ZMW', totalCost: 287740, q1: 287740, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-016', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 4: Employee Engagement', activity: 'Other Employee Engagement Initiatives', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '1.5.2', currency: 'ZMW', totalCost: 52000, q1: 13000, q2: 13000, q3: 13000, q4: 13000, spent: 0 },
    { id: 'CR-017', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 4: Employee Engagement', activity: 'Town Halls & Whole Team Socials', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '1.5.2', currency: 'ZMW', totalCost: 50000, q1: 0, q2: 16666.67, q3: 16666.67, q4: 16666.67, spent: 0 },
    { id: 'CR-018', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 4: Employee Engagement', activity: 'Employee Climate & Engagement Survey', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '1.5.2', currency: 'ZMW', totalCost: 60000, q1: 0, q2: 60000, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-019', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 4: Employee Engagement', activity: 'Leadership Assessment', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '1.5.2', currency: 'ZMW', totalCost: 50000, q1: 0, q2: 50000, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-020', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 4: Employee Engagement', activity: 'IDP Interventions', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '1.5.2', currency: 'ZMW', totalCost: 100000, q1: 0, q2: 0, q3: 100000, q4: 0, spent: 0 },

    // Supporting CSOs — Objective 5: Governance & M&E
    { id: 'CR-021', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 5: Board Oversight', activity: 'Board oversight', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '1.5.3', currency: 'ZMW', totalCost: 451500, q1: 112875, q2: 112875, q3: 112875, q4: 112875, spent: 0 },
    { id: 'CR-022', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 5: Audit', activity: 'Audits', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '1.5.3', currency: 'ZMW', totalCost: 215000, q1: 107500, q2: 107500, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-023', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 5: Learning & Convening', activity: 'Learning and Convening Events', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.5.4', currency: 'ZMW', totalCost: 1279080, q1: 0, q2: 639540, q3: 0, q4: 639540, spent: 0 },
    { id: 'CR-024', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 5: M&E', activity: 'Annual OS review meetings with consultants', budgetCode: '4000-010-004', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.5.5', currency: 'ZMW', totalCost: 59050, q1: 0, q2: 0, q3: 59050, q4: 0, spent: 0 },
    { id: 'CR-025', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 5: M&E', activity: 'Six M&E visits to CSO partners', budgetCode: '4000-010-004', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.3.1', currency: 'ZMW', totalCost: 625200, q1: 0, q2: 208400, q3: 208400, q4: 208400, spent: 0 },
    { id: 'CR-026', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 5: M&E', activity: 'Outcome harvest related activities', budgetCode: '4000-010-004', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.3.1', currency: 'ZMW', totalCost: 366860, q1: 0, q2: 122286.67, q3: 122286.67, q4: 122286.67, spent: 0 },
    { id: 'CR-027', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 5: M&E', activity: 'Programme Advisory Board meetings (2 in 2026)', budgetCode: '4000-010-004', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.3.1', currency: 'ZMW', totalCost: 28000, q1: 0, q2: 14000, q3: 0, q4: 14000, spent: 0 },
    { id: 'CR-028', fundingSource: 'Comic Relief', strategicPillar: 'Supporting CSOs', objective: 'Objective 5: M&E', activity: 'Development of M&E model and approaches', budgetCode: '4000-010-004', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '1.3.1', currency: 'ZMW', totalCost: 1200, q1: 0, q2: 600, q3: 600, q4: 0, spent: 0 },

    // Building the Field of Community Philanthropy
    { id: 'CR-030', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 6: Philanthropy Mapping', activity: 'Dissemination of Mapping of Philanthropy Actors Study', budgetCode: '4200-035-050', odooCode: '5300', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.6.5', currency: 'ZMW', totalCost: 59100, q1: 0, q2: 0, q3: 59100, q4: 0, spent: 0 },
    { id: 'CR-031', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 6: Philanthropy Mapping', activity: 'Country data collection for World Giving report', budgetCode: '4200-035-050', odooCode: '5300', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.6.5', currency: 'ZMW', totalCost: 50000, q1: 0, q2: 50000, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-032', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 6: Philanthropy Network', activity: 'Establishing Zambia Philanthropy Network (2 meetings)', budgetCode: '4200-035-050', odooCode: '5300', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.6.5', currency: 'ZMW', totalCost: 50000, q1: 0, q2: 0, q3: 50000, q4: 0, spent: 0 },
    { id: 'CR-033', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 6: CSO Mapping', activity: 'Mapping existing CSOs in Eastern, Central, Southern provinces', budgetCode: '4200-035-050', odooCode: '5300', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.6.5', currency: 'ZMW', totalCost: 220749.99, q1: 110374.99, q2: 110374.99, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-034', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 6: CSR Advocacy', activity: 'Corporate Social Responsibility (CSR) advocacy & research', budgetCode: '4200-035-050', odooCode: '5300', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.6.5', currency: 'ZMW', totalCost: 123000, q1: 0, q2: 0, q3: 0, q4: 123000, spent: 0 },

    // Building CF — Objective 7: Communications & Networking
    { id: 'CR-035', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 7: Media & Comms', activity: 'Media column - why are we shifting power? (Daily Mail)', budgetCode: '4200-035-050', odooCode: '5300', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.7.5', currency: 'ZMW', totalCost: 50000, q1: 12500, q2: 12500, q3: 12500, q4: 12500, spent: 0 },
    { id: 'CR-036', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 7: Media & Comms', activity: 'STP public awareness campaign & APN network subscription', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.7.5', currency: 'ZMW', totalCost: 84050, q1: 84050, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-037', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 7: Media & Comms', activity: 'Interschool debate', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.7.5', currency: 'ZMW', totalCost: 707080, q1: 176770, q2: 176770, q3: 176770, q4: 176770, spent: 0 },
    { id: 'CR-038', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 7: Media & Comms', activity: 'STP advocacy at Agricultural & Commercial Show', budgetCode: '4200-035-050', odooCode: '5300', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.7.5', currency: 'ZMW', totalCost: 88640, q1: 0, q2: 0, q3: 88640, q4: 0, spent: 0 },
    { id: 'CR-039', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 7: Media & Comms', activity: 'Radio & TV programmes', budgetCode: '4200-035-050', odooCode: '5300', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.7.5', currency: 'ZMW', totalCost: 126000, q1: 31500, q2: 31500, q3: 31500, q4: 31500, spent: 0 },
    { id: 'CR-040', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 7: Media & Comms', activity: 'ZGF STP visibility (IEC Materials, Press Briefings)', budgetCode: '4200-035-050', odooCode: '5300', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.7.5', currency: 'ZMW', totalCost: 207000, q1: 51750, q2: 51750, q3: 51750, q4: 51750, spent: 0 },
    { id: 'CR-041', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 7: Media & Comms', activity: 'Training for STP reporters', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '3.7.2', currency: 'ZMW', totalCost: 80000, q1: 80000, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-042', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 7: Media & Comms', activity: 'CSSF successful applicants documentary', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '3.7.2', currency: 'ZMW', totalCost: 189300, q1: 0, q2: 189300, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-043', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 7: Media & Comms', activity: 'Training ZGF partners on comms strategy development', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '3.7.2', currency: 'ZMW', totalCost: 348000, q1: 87000, q2: 87000, q3: 87000, q4: 87000, spent: 0 },
    { id: 'CR-044', fundingSource: 'Comic Relief', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 7: Media & Comms', activity: 'Reverse Call for Proposals (2nd Iteration)', budgetCode: '4300-050-090-325', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '3.7.1', currency: 'ZMW', totalCost: 100000, q1: 0, q2: 50000, q3: 50000, q4: 0, spent: 0 },

    // Operations
    { id: 'CR-050', fundingSource: 'Comic Relief', strategicPillar: 'Operations', objective: 'Objective 8: Staff Costs', activity: 'Staff Development - Meals & Physical Wellness', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '4.8.4', currency: 'ZMW', totalCost: 300000, q1: 50000, q2: 87500, q3: 87500, q4: 75000, spent: 0 },
    { id: 'CR-051', fundingSource: 'Comic Relief', strategicPillar: 'Operations', objective: 'Objective 8: Staff Costs', activity: 'Staff Development - Professional Fees', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '4.8.4', currency: 'ZMW', totalCost: 40000, q1: 20000, q2: 20000, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-052', fundingSource: 'Comic Relief', strategicPillar: 'Operations', objective: 'Objective 8: Staff Costs', activity: 'Staff Development - Annual Professional Body Meetings', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '4.8.4', currency: 'ZMW', totalCost: 275000, q1: 0, q2: 91666.67, q3: 91666.67, q4: 91666.67, spent: 0 },
    { id: 'CR-053', fundingSource: 'Comic Relief', strategicPillar: 'Operations', objective: 'Objective 8: Staff Costs', activity: 'Staff Time Charges (Monthly)', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '4.8.4', currency: 'ZMW', totalCost: 7237260.80, q1: 1421604.80, q2: 1938552, q3: 1938552, q4: 1938552, spent: 0 },
    { id: 'CR-054', fundingSource: 'Comic Relief', strategicPillar: 'Operations', objective: 'Objective 8: Staff Costs', activity: 'Medical - Staff Health Insurance', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '4.8.4', currency: 'ZMW', totalCost: 750000, q1: 187500, q2: 187500, q3: 187500, q4: 187500, spent: 0 },
    { id: 'CR-055', fundingSource: 'Comic Relief', strategicPillar: 'Operations', objective: 'Objective 8: Overheads', activity: 'Overheads - Monthly Indirect Costs', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.8.4', currency: 'ZMW', totalCost: 1328802, q1: 332200.50, q2: 332200.50, q3: 332200.50, q4: 332200.50, spent: 0 },
    { id: 'CR-056', fundingSource: 'Comic Relief', strategicPillar: 'Operations', objective: 'Objective 8: Capital Expenditure', activity: 'Capital Expenditure - Projector', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.8.4', currency: 'ZMW', totalCost: 10000, q1: 10000, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-057', fundingSource: 'Comic Relief', strategicPillar: 'Operations', objective: 'Objective 8: Capital Expenditure', activity: 'Capital Expenditure - Conference TV', budgetCode: '4200-035-050', odooCode: '5300', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '4.8.4', currency: 'ZMW', totalCost: 70000, q1: 70000, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-058', fundingSource: 'Comic Relief', strategicPillar: 'Operations', objective: 'Objective 8: Capital Expenditure', activity: 'Capital Expenditure - ERP System', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.8.4', currency: 'ZMW', totalCost: 220000, q1: 110000, q2: 110000, q3: 0, q4: 0, spent: 0 },
    { id: 'CR-059', fundingSource: 'Comic Relief', strategicPillar: 'Operations', objective: 'Objective 8: Capital Expenditure', activity: 'Capital Expenditure - Replacement of 11 Laptops', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.8.4', currency: 'ZMW', totalCost: 330000, q1: 330000, q2: 0, q3: 0, q4: 0, spent: 0 },

    // ═══════════════════════════════════════════════════════════════════════════
    // MOTTIII  (18 lines — Total K3,504,858)
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'MT-001', fundingSource: 'MOTTIII', strategicPillar: 'Strengthening Communities', objective: 'Objective 1: CF Grants', activity: 'Annual Grant Disbursements to 11 Community Foundations', budgetCode: '4000-010-004', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.1.1', currency: 'ZMW', totalCost: 390059.67, q1: 390059.67, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-002', fundingSource: 'MOTTIII', strategicPillar: 'Strengthening Communities', objective: 'Objective 11: M&E', activity: 'Grants M&E Visits', budgetCode: '4000-010-004', odooCode: '5100', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.11.1', currency: 'ZMW', totalCost: 140963, q1: 46987.67, q2: 46987.67, q3: 46987.67, q4: 0, spent: 0 },
    { id: 'MT-003', fundingSource: 'MOTTIII', strategicPillar: 'Strengthening Communities', objective: 'Objective 2: CF Capacity Development', activity: 'Individual Mentoring & Coaching of CF Staff', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '2.2.2', currency: 'ZMW', totalCost: 190098, q1: 190098, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-004', fundingSource: 'MOTTIII', strategicPillar: 'Strengthening Communities', objective: 'Objective 2: CF Capacity Development', activity: 'CF Board Members Training - Governance', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '2.2.2', currency: 'ZMW', totalCost: 238260, q1: 238260, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-005', fundingSource: 'MOTTIII', strategicPillar: 'Strengthening Communities', objective: 'Objective 3: Community Development', activity: 'Community Engagement & Advocacy Training (3 Districts)', budgetCode: '4200-030-022-360', odooCode: '5500', odooCategory: 'Community Engagement & Field Work', zgfCode: '2.3.2', currency: 'ZMW', totalCost: 117900, q1: 0, q2: 117900, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-006', fundingSource: 'MOTTIII', strategicPillar: 'Strengthening Communities', objective: 'Objective 4: Networking & Learning', activity: 'CF Network Meeting (Lusaka)', budgetCode: '4200-030-022-360', odooCode: '5500', odooCategory: 'Community Engagement & Field Work', zgfCode: '2.4.1', currency: 'ZMW', totalCost: 130360, q1: 130360, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-007', fundingSource: 'MOTTIII', strategicPillar: 'Strengthening Communities', objective: 'Objective 4: Networking & Learning', activity: 'CF Study Visit (3 Districts)', budgetCode: '4200-030-022-360', odooCode: '5500', odooCategory: 'Community Engagement & Field Work', zgfCode: '2.4.1', currency: 'ZMW', totalCost: 117900, q1: 117900, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-008', fundingSource: 'MOTTIII', strategicPillar: 'Strengthening Communities', objective: 'Objective 9: Financial Asset Building', activity: 'CF Support - Financial Asset Building (3 Districts)', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.9.1', currency: 'ZMW', totalCost: 73528, q1: 24509.33, q2: 24509.33, q3: 24509.33, q4: 0, spent: 0 },
    { id: 'MT-009', fundingSource: 'MOTTIII', strategicPillar: 'Strengthening Communities', objective: 'Objective 8: Agroecology', activity: 'Training in Climate Change Adaptation & FMNR (3 Districts)', budgetCode: '4000-015-007-010', odooCode: '5400', odooCategory: 'Training & Learning', zgfCode: '2.8.2', currency: 'ZMW', totalCost: 70208, q1: 0, q2: 70208, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-010', fundingSource: 'MOTTIII', strategicPillar: 'Strengthening Communities', objective: 'Objective 7: Repositioning CF Model', activity: 'Field Visit to 3 Districts (CF Model Brainstorming)', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Training & Learning', zgfCode: '2.7.2', currency: 'ZMW', totalCost: 67908, q1: 0, q2: 67908, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-020', fundingSource: 'MOTTIII', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 12: Communications & Networking', activity: "Support the launch of CF's Strategic Plans", budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Community Engagement & Field Work', zgfCode: '2.12.3', currency: 'ZMW', totalCost: 137450, q1: 137450, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-021', fundingSource: 'MOTTIII', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 12: Communications & Networking', activity: 'Media & CSO familiarisation trip to 2 communities', budgetCode: '4200-030-022-360', odooCode: '5300', odooCategory: 'Community Engagement & Field Work', zgfCode: '3.12.3', currency: 'ZMW', totalCost: 31580, q1: 0, q2: 31580, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-022', fundingSource: 'MOTTIII', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 12: Communications & Networking', activity: 'Courtesy call to Ministry of Local Government', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.12.5', currency: 'ZMW', totalCost: 3340, q1: 0, q2: 3340, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-023', fundingSource: 'MOTTIII', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 12: Communications & Networking', activity: 'CF Documentaries', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.12.5', currency: 'ZMW', totalCost: 63660, q1: 63660, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-024', fundingSource: 'MOTTIII', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 12: Communications & Networking', activity: 'Regional Conferences (Community Foundations)', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.12.5', currency: 'ZMW', totalCost: 200000, q1: 0, q2: 200000, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-025', fundingSource: 'MOTTIII', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 12: Communications & Networking', activity: 'CSO Fair - Community Resilience Exhibition', budgetCode: '4200-030-022-360', odooCode: '5500', odooCategory: 'Community Engagement & Field Work', zgfCode: '3.12.3', currency: 'ZMW', totalCost: 169600, q1: 169600, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'MT-026', fundingSource: 'MOTTIII', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'Objective 12: Communications & Networking', activity: 'Radio & TV Programmes on CF and CLD', budgetCode: '4200-035-050', odooCode: '5300', odooCategory: 'Philanthropy, Communications & Visibility', zgfCode: '3.12.5', currency: 'ZMW', totalCost: 30000, q1: 15000, q2: 0, q3: 15000, q4: 0, spent: 0 },
    { id: 'MT-030', fundingSource: 'MOTTIII', strategicPillar: 'Operations', objective: 'Objective 13: Operational Costs', activity: 'Staff Time Charges (9 months)', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '4.13.4', currency: 'ZMW', totalCost: 1184994, q1: 394998, q2: 394998, q3: 394998, q4: 0, spent: 0 },
    { id: 'MT-031', fundingSource: 'MOTTIII', strategicPillar: 'Operations', objective: 'Objective 13: Operational Costs', activity: 'Overheads - Monthly Indirect Costs', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.13.4', currency: 'ZMW', totalCost: 238500, q1: 79500, q2: 79500, q3: 79500, q4: 0, spent: 0 },

    // ═══════════════════════════════════════════════════════════════════════════
    // KaluluII  (19 lines — Total K3,226,199.08)
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'KL-001', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Civic Education & Voter Information', activity: 'Ward Based Civic Education', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.1.1', currency: 'ZMW', totalCost: 156000, q1: 39000, q2: 39000, q3: 39000, q4: 39000, spent: 0 },
    { id: 'KL-002', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Civic Education & Voter Information', activity: 'Community Radio Broadcasts on Civic Issues', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.1.2', currency: 'ZMW', totalCost: 84000, q1: 21000, q2: 21000, q3: 21000, q4: 21000, spent: 0 },
    { id: 'KL-003', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Civic Education & Voter Information', activity: 'Production of Civic Education IEC materials', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.1.3', currency: 'ZMW', totalCost: 45000, q1: 45000, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'KL-004', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Civic Education & Voter Information', activity: 'Youth Civic Engagement Camps', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.1.4', currency: 'ZMW', totalCost: 95000, q1: 0, q2: 47500, q3: 47500, q4: 0, spent: 0 },
    { id: 'KL-005', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Voter Education & Registration Support', activity: 'Voter Registration Support Drives', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.1.5', currency: 'ZMW', totalCost: 112000, q1: 0, q2: 56000, q3: 56000, q4: 0, spent: 0 },
    { id: 'KL-010', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Governance Strengthening', activity: 'Ward Development Committee Capacity Building', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.2.1', currency: 'ZMW', totalCost: 128400, q1: 32100, q2: 32100, q3: 32100, q4: 32100, spent: 0 },
    { id: 'KL-011', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Governance Strengthening', activity: 'Community Accountability Forums', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.2.2', currency: 'ZMW', totalCost: 76800, q1: 19200, q2: 19200, q3: 19200, q4: 19200, spent: 0 },
    { id: 'KL-012', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Human Rights Promotion', activity: 'Human Rights Awareness Workshops', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.2.3', currency: 'ZMW', totalCost: 54000, q1: 13500, q2: 13500, q3: 13500, q4: 13500, spent: 0 },
    { id: 'KL-013', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Human Rights Promotion', activity: 'Legal Aid Clinics for Vulnerable Communities', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.2.4', currency: 'ZMW', totalCost: 88000, q1: 22000, q2: 22000, q3: 22000, q4: 22000, spent: 0 },
    { id: 'KL-014', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Gender and Social Inclusion', activity: "Women's Leadership Training", budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.2.5', currency: 'ZMW', totalCost: 62400, q1: 0, q2: 31200, q3: 31200, q4: 0, spent: 0 },
    { id: 'KL-020', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Community Development', activity: 'Community Needs Assessment', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.3.1', currency: 'ZMW', totalCost: 38000, q1: 38000, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'KL-021', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Community Development', activity: 'Youth Group Formation and Registration', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.3.2', currency: 'ZMW', totalCost: 48000, q1: 12000, q2: 12000, q3: 12000, q4: 12000, spent: 0 },
    { id: 'KL-022', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Monitoring and Evaluation', activity: 'Peer to peer learning visits', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.4.1', currency: 'ZMW', totalCost: 38120, q1: 0, q2: 19060, q3: 19060, q4: 0, spent: 0 },
    { id: 'KL-023', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Monitoring and Evaluation', activity: 'Monitoring and Compliance visits', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.4.1', currency: 'ZMW', totalCost: 78080, q1: 19520, q2: 19520, q3: 19520, q4: 19520, spent: 0 },
    { id: 'KL-030', fundingSource: 'KaluluII', strategicPillar: 'Strengthening Communities', objective: 'Capacity Development', activity: 'Skills Training for Youth Groups', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '2.3.3', currency: 'ZMW', totalCost: 92000, q1: 0, q2: 46000, q3: 46000, q4: 0, spent: 0 },
    { id: 'KL-035', fundingSource: 'KaluluII', strategicPillar: 'Building the Field of Community Philanthropy', objective: 'CF Philanthropy Promotion', activity: 'Community Philanthropy Awareness Campaigns', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Grants & Capacity Strengthening', zgfCode: '3.1.1', currency: 'ZMW', totalCost: 129800, q1: 13650, q2: 51250, q3: 51250, q4: 13650, spent: 0 },
    { id: 'KL-040', fundingSource: 'KaluluII', strategicPillar: 'Operations', objective: 'Operational / Running costs', activity: 'Overheads (7%) of Direct Costs', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.5.4', currency: 'ZMW', totalCost: 78192.10, q1: 26443.90, q2: 27229.30, q3: 18794.30, q4: 5724.60, spent: 0 },
    { id: 'KL-041', fundingSource: 'KaluluII', strategicPillar: 'Operations', objective: 'Staff Costs', activity: 'Staff Input', budgetCode: '4300-050-090-320', odooCode: '5700', odooCategory: 'Staff Costs', zgfCode: '4.5.4', currency: 'ZMW', totalCost: 1917996.48, q1: 479499.12, q2: 517159.29, q3: 517159.29, q4: 517159.29, spent: 0 },

    // ═══════════════════════════════════════════════════════════════════════════
    // ZGF  (6 lines — Total K1,104,500)
    // ═══════════════════════════════════════════════════════════════════════════
    { id: 'ZGF-001', fundingSource: 'ZGF', strategicPillar: 'Operations', objective: '1. Organisational Governance', activity: 'Convene ZGF AGM', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.1.4', currency: 'ZMW', totalCost: 45500, q1: 45500, q2: 0, q3: 0, q4: 0, spent: 0 },
    { id: 'ZGF-002', fundingSource: 'ZGF', strategicPillar: 'Operations', objective: '2. Asset Management', activity: 'Depreciation Charges', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.1.4', currency: 'ZMW', totalCost: 780000, q1: 195000, q2: 195000, q3: 195000, q4: 195000, spent: 0 },
    { id: 'ZGF-003', fundingSource: 'ZGF', strategicPillar: 'Operations', objective: '3. Clear Outstanding Liabilities', activity: 'Accrued liabilities - ZRA (25% penalties)', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.1.4', currency: 'ZMW', totalCost: 85000, q1: 0, q2: 85000, q3: 0, q4: 0, spent: 0 },
    { id: 'ZGF-004', fundingSource: 'ZGF', strategicPillar: 'Operations', objective: '4. Clear Outstanding Liabilities', activity: 'Accrued liabilities - Legal Fees', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.1.4', currency: 'ZMW', totalCost: 140000, q1: 35000, q2: 35000, q3: 35000, q4: 35000, spent: 0 },
    { id: 'ZGF-005', fundingSource: 'ZGF', strategicPillar: 'Operations', objective: '5. Indirect Costs', activity: 'General Overheads', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.1.4', currency: 'ZMW', totalCost: 42000, q1: 10500, q2: 10500, q3: 10500, q4: 10500, spent: 0 },
    { id: 'ZGF-006', fundingSource: 'ZGF', strategicPillar: 'Operations', objective: '6. Bank Charges', activity: 'Bank Charges - ZGF Corporate A/Cs', budgetCode: '4300-050-090-325', odooCode: '5800', odooCategory: 'Operations / Running Costs', zgfCode: '4.1.4', currency: 'ZMW', totalCost: 12000, q1: 3000, q2: 3000, q3: 3000, q4: 3000, spent: 0 },
];

// Real payment requests mapped from Excel (overridden by SharePoint live sync if connected)
import parsedRequests from './seedPaymentRequests.js';

// Utility to match a payment request to a specific budget line ID
const findBudgetLineId = (req) => {
    // Exact match by budget code and funding source
    const code = req.budget_code?.trim() || '';
    const name = req.name?.toLowerCase() || '';
    let fs = req.funding_source?.toLowerCase() || '';

    // Normalize funding source variations from raw data
    if (fs.includes('kalulu')) fs = 'kaluluii';
    if (fs.includes('mott')) fs = 'mottiii';
    if (fs === 'zgf ') fs = 'zgf';

    // 1. Try exact match by budgetCode or zgfCode for the specific funding source
    let match = budgetLines.find(bl =>
        (bl.budgetCode === code || bl.zgfCode === code) &&
        bl.fundingSource.toLowerCase() === fs
    );
    if (match) return match.id;

    // 2. Try match by budgetCode or zgfCode regardless of funding source 
    // (if funding source is blank or messy in Excel)
    match = budgetLines.find(bl => bl.budgetCode === code || bl.zgfCode === code);
    if (match) return match.id;

    // 3. If the code is text (like "Operations"), try to match the pillar or objective
    if (code && isNaN(parseInt(code[0]))) {
        const codeLower = code.toLowerCase();
        match = budgetLines.find(bl =>
            (bl.strategicPillar.toLowerCase().includes(codeLower) ||
                bl.objective.toLowerCase().includes(codeLower)) &&
            bl.fundingSource.toLowerCase() === fs
        );
        if (match) return match.id;
    }

    // 4. Handle Legacy / Custom Code Mappings from Excel export
    // '5.3.1' usually maps to Staff Costs (4.8.4 for CR, 4.1.4 for ZGF, 4.5.4 for Kalulu, 4.13.4 for Mott)
    if (code === '5.3.1' || name.includes('staff member') || name.includes('Net Pay') || name.includes('NAPSA')) {
        let scMatch = budgetLines.find(bl => bl.activity.includes('Staff Time Charges') && bl.fundingSource.toLowerCase() === fs);
        if (!scMatch && fs === 'zgf') scMatch = budgetLines.find(bl => bl.id === 'ZGF-005'); // ZGF Overheads fallback
        if (!scMatch && fs === 'kaluluii') scMatch = budgetLines.find(bl => bl.id === 'KL-041');
        if (scMatch) return scMatch.id;
    }

    // '1.2', '8.3', '4.2', '1.4.4' map to Governance / Board Fees / Overheads
    if (['1.2', '8.3', '4.2', '1.4.4'].includes(code) || name.includes('Board') || name.includes('Membership')) {
        let govMatch = budgetLines.find(bl => bl.objective.includes('Board') && bl.fundingSource.toLowerCase() === fs);
        if (!govMatch) govMatch = budgetLines.find(bl => bl.activity.includes('Overhead') && bl.fundingSource.toLowerCase() === fs);
        if (!govMatch && fs === 'zgf') govMatch = budgetLines.find(bl => bl.id === 'ZGF-001'); // ZGF Board
        if (govMatch) return govMatch.id;
    }

    // Additional Text-based Fallbacks for Anomalies
    const nameLower = name.toLowerCase();
    if (nameLower.includes('training') || nameLower.includes('workshop')) {
        const trainMatch = budgetLines.find(bl => bl.odooCategory === 'Training & Learning' && bl.fundingSource.toLowerCase() === fs);
        if (trainMatch) return trainMatch.id;
    }
    if (nameLower.includes('advert') || nameLower.includes('media') || nameLower.includes('documentary')) {
        const advMatch = budgetLines.find(bl => bl.odooCategory.includes('Communications') && bl.fundingSource.toLowerCase() === fs);
        if (advMatch) return advMatch.id;
    }
    if (nameLower.includes('medical') || nameLower.includes('gratuity') || fs === 'loop') {
        const scMatch = budgetLines.find(bl => bl.activity.includes('Staff Time Charges') && bl.fundingSource.toLowerCase() === (fs === 'loop' ? 'comic relief' : fs));
        if (scMatch) return scMatch.id;
        if (fs === 'zgf') return 'ZGF-005';
    }
    if (nameLower.includes('festival') || nameLower.includes('shifting cultures') || nameLower.includes('visa')) {
        return 'CR-037'; // Media/Comms line
    }
    if (nameLower.includes('fresh water')) {
        return 'KL-020'; // Community needs assessment
    }
    if (nameLower.includes('meeting') || nameLower.includes('engagement') || nameLower.includes('visit') || nameLower.includes('participation')) {
        const meetMatch = budgetLines.find(bl => (bl.activity.toLowerCase().includes('meeting') || bl.activity.toLowerCase().includes('visit')) && bl.fundingSource.toLowerCase() === fs);
        if (meetMatch) return meetMatch.id;
        if (fs === 'comic relief') return 'CR-001';
    }
    if (nameLower.includes('recovery') && fs === 'mottiii') {
        return 'MT-005'; // Mott generic operations fallback
    }
    if (nameLower.includes('financial management') && fs === 'comic relief') {
        return 'CR-054'; // CR Training
    }
    if (nameLower.includes('pmi membership')) return 'CR-068'; // CR subscriptions

    // 5. Fallback to name search across all lines for this funding source
    if (name) {
        match = budgetLines.find(bl =>
            name.includes(bl.activity.toLowerCase()) &&
            bl.fundingSource.toLowerCase() === fs
        );
        if (match) return match.id;

        // Final fallback: name search ignoring funding source
        match = budgetLines.find(bl => name.includes(bl.activity.toLowerCase()));
        if (match) return match.id;
    }

    return null; // Unmapped
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
}));

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
    const totalSpent = lines.reduce((s, l) => s + (l.spent || 0), 0);
    const remaining = totalBudget - totalSpent;
    const pctUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    return { totalBudget, totalSpent, remaining, pctUsed };
}
