-- ============================================================
-- ZGF Smart Budget Tracker — Complete Seed Data
-- ALL funding sources: Comic Relief, MOTTIII, KaluluII, ZGF
-- Total Budget: ZMW 68,540,561.96
-- Run AFTER schema.sql in your Supabase SQL Editor
-- ============================================================

insert into public.budget_lines
  (id, funding_source, strategic_pillar, objective, activity, budget_code, odoo_code, odoo_category, zgf_code, currency, total_cost, q1, q2, q3, q4, spent)
values

-- ── COMIC RELIEF (K60,662,504.88) ──────────────────────────────────────────
('CR-001','Comic Relief','Supporting CSOs','Objective 1: Support to SDOs','Support District CSOs (Annual Grant Disbursements)','4000-010-004','5100','Grants & Capacity Strengthening','1.1.1','ZMW',5220000,5220000,0,0,0,0),
('CR-002','Comic Relief','Supporting CSOs','Objective 1: Support to SDOs','Grants Management & Compliance Visits to SDOs','4000-010-004','5100','Grants & Capacity Strengthening','1.1.2','ZMW',1572300,393075,393075,393075,393075,0),
('CR-003','Comic Relief','Supporting CSOs','Objective 2: Capacity Building for CSOs','Capacity Building Training for Partner CSOs','4000-015-007-010','5400','Training & Learning','1.2.2','ZMW',2856777.5,2856777.5,0,0,0,0),
('CR-004','Comic Relief','Supporting CSOs','Objective 2: Capacity Building for CSOs','Financial Management Training for SDOs','4000-015-007-010','5400','Training & Learning','1.2.3','ZMW',1450000,0,724000,726000,0,0),
('CR-005','Comic Relief','Supporting CSOs','Objective 3: Monitoring & Evaluation','M&E Visits to SDO Partners','4000-010-004','5100','Grants & Capacity Strengthening','1.3.1','ZMW',1200000,300000,300000,300000,300000,0),
('CR-006','Comic Relief','Supporting CSOs','Objective 4: Community Small Grants','CSSF Grant Disbursements (3rd Cohort)','4000-010-004','5100','Grants & Capacity Strengthening','1.4.1','ZMW',7680000,0,0,3840000,3840000,0),
('CR-007','Comic Relief','Supporting CSOs','Objective 4: Community Small Grants','CSSF Monitoring & Mentoring Visits','4200-030-022-360','5500','Community Engagement & Field Work','1.4.2','ZMW',960000,0,0,480000,480000,0),
('CR-008','Comic Relief','Supporting CSOs','Objective 5: Partner Organisational Development','Organisational Assessments for SDOs','4300-050-090-325','5800','Grants & Capacity Strengthening','1.5.1','ZMW',780000,780000,0,0,0,0),
('CR-020','Comic Relief','Building the Field of Community Philanthropy','Objective 6: Community Philanthropy Promotion','STP advocacy at Agricultural & Commercial Show','4200-035-050','5300','Philanthropy, Communications & Visibility','3.7.5','ZMW',88640,0,0,88640,0,0),
('CR-021','Comic Relief','Building the Field of Community Philanthropy','Objective 6: Community Philanthropy Promotion','Radio & TV programmes on Community Philanthropy','4200-035-050','5300','Philanthropy, Communications & Visibility','3.7.5','ZMW',126000,31500,31500,31500,31500,0),
('CR-022','Comic Relief','Building the Field of Community Philanthropy','Objective 6: Community Philanthropy Promotion','ZGF STP visibility (IEC Materials, Press Briefings)','4200-035-050','5300','Philanthropy, Communications & Visibility','3.7.5','ZMW',207000,51750,51750,51750,51750,0),
('CR-023','Comic Relief','Building the Field of Community Philanthropy','Objective 7: Media & Comms','Training for STP reporters','4000-015-007-010','5400','Training & Learning','3.7.2','ZMW',80000,80000,0,0,0,0),
('CR-024','Comic Relief','Building the Field of Community Philanthropy','Objective 7: Media & Comms','CSSF successful applicants documentary','4000-015-007-010','5400','Training & Learning','3.7.2','ZMW',189300,0,189300,0,0,0),
('CR-025','Comic Relief','Building the Field of Community Philanthropy','Objective 7: Media & Comms','Training ZGF partners on comms strategy development','4000-015-007-010','5400','Training & Learning','3.7.2','ZMW',348000,87000,87000,87000,87000,0),
('CR-026','Comic Relief','Building the Field of Community Philanthropy','Objective 7: Media & Comms','Reverse Call for Proposals (2nd Iteration)','4300-050-090-325','5100','Grants & Capacity Strengthening','3.7.1','ZMW',100000,0,50000,50000,0,0),
('CR-030','Comic Relief','Operations','Objective 8: Operational / Running Costs','Staff Development - Meals & Physical Wellness','4300-050-090-320','5700','Staff Costs','4.8.4','ZMW',300000,50000,87500,87500,75000,0),
('CR-031','Comic Relief','Operations','Objective 8: Operational / Running Costs','Staff Development - Professional Fees','4300-050-090-320','5700','Staff Costs','4.8.4','ZMW',40000,20000,20000,0,0,0),
('CR-032','Comic Relief','Operations','Objective 8: Operational / Running Costs','Staff Development - Annual Professional Body Meetings','4300-050-090-320','5700','Staff Costs','4.8.4','ZMW',275000,0,91666.67,91666.67,91666.67,0),
('CR-033','Comic Relief','Operations','Objective 8: Operational / Running Costs','Staff Time Charges (Monthly)','4300-050-090-320','5700','Staff Costs','4.8.4','ZMW',7237260.80,1421604.80,1938552,1938552,1938552,0),
('CR-034','Comic Relief','Operations','Objective 8: Operational / Running Costs','Medical - Staff Health Insurance','4300-050-090-320','5700','Staff Costs','4.8.4','ZMW',750000,187500,187500,187500,187500,0),
('CR-035','Comic Relief','Operations','Objective 8: Operational / Running Costs','Overheads - Monthly Indirect Costs','4300-050-090-325','5800','Operations / Running Costs','4.8.4','ZMW',1328802,332200.5,332200.5,332200.5,332200.5,0),
('CR-036','Comic Relief','Operations','Objective 8: Operational / Running Costs','Capital Expenditure - Projector','4300-050-090-325','5800','Operations / Running Costs','4.8.4','ZMW',10000,10000,0,0,0,0),
('CR-037','Comic Relief','Operations','Objective 8: Operational / Running Costs','Capital Expenditure - Conference TV','4200-035-050','5300','Philanthropy, Communications & Visibility','4.8.4','ZMW',70000,70000,0,0,0,0),
('CR-038','Comic Relief','Operations','Objective 8: Operational / Running Costs','Capital Expenditure - ERP System','4300-050-090-325','5800','Operations / Running Costs','4.8.4','ZMW',220000,110000,110000,0,0,0),
('CR-039','Comic Relief','Operations','Objective 8: Operational / Running Costs','Capital Expenditure - Replacement of 11 Laptops','4300-050-090-325','5800','Operations / Running Costs','4.8.4','ZMW',330000,330000,0,0,0,0),

-- ── MOTTIII (K3,504,858) ─────────────────────────────────────────────────
('MT-001','MOTTIII','Strengthening Communities','Objective 1: Community Foundation Grants','Annual Grant Disbursements to 11 Community Foundations','4000-010-004','5100','Grants & Capacity Strengthening','2.1.1','ZMW',390059.67,390059.67,0,0,0,0),
('MT-002','MOTTIII','Strengthening Communities','Objective 1: Community Foundation Grants','Grants M&E Visits','4000-010-004','5100','Grants & Capacity Strengthening','2.11.1','ZMW',140963,46987.67,46987.67,46987.67,0,0),
('MT-003','MOTTIII','Strengthening Communities','Objective 2: CF Capacity Development','Individual Mentoring & Coaching of CF Staff','4000-015-007-010','5400','Training & Learning','2.2.2','ZMW',190098,190098,0,0,0,0),
('MT-004','MOTTIII','Strengthening Communities','Objective 2: CF Capacity Development','CF Board Members Training - Governance','4000-015-007-010','5400','Training & Learning','2.2.2','ZMW',238260,238260,0,0,0,0),
('MT-005','MOTTIII','Strengthening Communities','Objective 3: Community Development','Community Engagement & Advocacy Training in 3 Districts','4200-030-022-360','5500','Community Engagement & Field Work','2.3.2','ZMW',117900,0,117900,0,0,0),
('MT-006','MOTTIII','Strengthening Communities','Objective 4: Networking & Learning','CF Network Meeting (Lusaka)','4200-030-022-360','5500','Community Engagement & Field Work','2.4.1','ZMW',130360,130360,0,0,0,0),
('MT-007','MOTTIII','Strengthening Communities','Objective 4: Networking & Learning','CF Study Visit (3 Districts)','4200-030-022-360','5500','Community Engagement & Field Work','2.4.1','ZMW',117900,117900,0,0,0,0),
('MT-008','MOTTIII','Strengthening Communities','Objective 5: Financial Asset Building','CF Support - Financial Asset Building in 3 Districts','4300-050-090-325','5800','Grants & Capacity Strengthening','2.9.1','ZMW',73528,24509.33,24509.33,24509.33,0,0),
('MT-009','MOTTIII','Strengthening Communities','Objective 6: Agroecology & Climate Adaptation','Training in Climate Change Adaptation & FMNR (3 Districts)','4000-015-007-010','5400','Training & Learning','2.8.2','ZMW',70208,0,70208,0,0,0),
('MT-010','MOTTIII','Strengthening Communities','Objective 7: Repositioning CF Model','Field Visit to 3 Districts (CF Model Brainstorming)','4300-050-090-325','5800','Training & Learning','2.7.2','ZMW',67908,0,67908,0,0,0),
('MT-020','MOTTIII','Building the Field of Community Philanthropy','Objective 12: Communications & Networking','Support the launch of CF Strategic Plans','4300-050-090-325','5800','Community Engagement & Field Work','2.12.3','ZMW',137450,137450,0,0,0,0),
('MT-021','MOTTIII','Building the Field of Community Philanthropy','Objective 12: Communications & Networking','Media & CSO partners familiarisation trip to 2 communities','4200-030-022-360','5300','Community Engagement & Field Work','3.12.3','ZMW',31580,0,31580,0,0,0),
('MT-022','MOTTIII','Building the Field of Community Philanthropy','Objective 12: Communications & Networking','Courtesy call to Ministry of Local Government','4300-050-090-325','5800','Philanthropy, Communications & Visibility','3.12.5','ZMW',3340,0,3340,0,0,0),
('MT-023','MOTTIII','Building the Field of Community Philanthropy','Objective 12: Communications & Networking','CF Documentaries','4300-050-090-325','5800','Philanthropy, Communications & Visibility','3.12.5','ZMW',63660,63660,0,0,0,0),
('MT-024','MOTTIII','Building the Field of Community Philanthropy','Objective 12: Communications & Networking','Regional Conferences (Community Foundations)','4300-050-090-325','5800','Philanthropy, Communications & Visibility','3.12.5','ZMW',200000,0,200000,0,0,0),
('MT-025','MOTTIII','Building the Field of Community Philanthropy','Objective 12: Communications & Networking','CSO Fair - Community Resilience Exhibition','4200-030-022-360','5500','Community Engagement & Field Work','3.12.3','ZMW',169600,169600,0,0,0,0),
('MT-026','MOTTIII','Building the Field of Community Philanthropy','Objective 12: Communications & Networking','Radio & TV Programmes on CF and CLD','4200-035-050','5300','Philanthropy, Communications & Visibility','3.12.5','ZMW',30000,15000,0,15000,0,0),
('MT-030','MOTTIII','Operations','Objective 13: Operational / Running Costs','Staff Time Charges (9 months)','4300-050-090-320','5700','Staff Costs','4.13.4','ZMW',1184994,394998,394998,394998,0,0),
('MT-031','MOTTIII','Operations','Objective 13: Operational / Running Costs','Overheads - Monthly Indirect Costs','4300-050-090-325','5800','Operations / Running Costs','4.13.4','ZMW',238500,79500,79500,79500,0,0),

-- ── KaluluII (K3,226,199.08) ─────────────────────────────────────────────
('KL-001','KaluluII','Strengthening Communities','Civic Education & Voter Information','Ward Based Civic Education','4300-050-090-325','5800','Grants & Capacity Strengthening','2.1.1','ZMW',156000,39000,39000,39000,39000,0),
('KL-002','KaluluII','Strengthening Communities','Civic Education & Voter Information','Community Radio Broadcasts on Civic Issues','4300-050-090-325','5800','Grants & Capacity Strengthening','2.1.2','ZMW',84000,21000,21000,21000,21000,0),
('KL-003','KaluluII','Strengthening Communities','Civic Education & Voter Information','Production of Civic Education IEC materials','4300-050-090-325','5800','Grants & Capacity Strengthening','2.1.3','ZMW',45000,45000,0,0,0,0),
('KL-004','KaluluII','Strengthening Communities','Civic Education & Voter Information','Youth Civic Engagement Camps','4300-050-090-325','5800','Grants & Capacity Strengthening','2.1.4','ZMW',95000,0,47500,47500,0,0),
('KL-005','KaluluII','Strengthening Communities','Voter Education & Registration Support','Voter Registration Support Drives','4300-050-090-325','5800','Grants & Capacity Strengthening','2.1.5','ZMW',112000,0,56000,56000,0,0),
('KL-010','KaluluII','Strengthening Communities','Governance Strengthening','Ward Development Committee Capacity Building','4300-050-090-325','5800','Grants & Capacity Strengthening','2.2.1','ZMW',128400,32100,32100,32100,32100,0),
('KL-011','KaluluII','Strengthening Communities','Governance Strengthening','Community Accountability Forums','4300-050-090-325','5800','Grants & Capacity Strengthening','2.2.2','ZMW',76800,19200,19200,19200,19200,0),
('KL-012','KaluluII','Strengthening Communities','Human Rights Promotion','Human Rights Awareness Workshops','4300-050-090-325','5800','Grants & Capacity Strengthening','2.2.3','ZMW',54000,13500,13500,13500,13500,0),
('KL-013','KaluluII','Strengthening Communities','Human Rights Promotion','Legal Aid Clinics for Vulnerable Communities','4300-050-090-325','5800','Grants & Capacity Strengthening','2.2.4','ZMW',88000,22000,22000,22000,22000,0),
('KL-014','KaluluII','Strengthening Communities','Gender and Social Inclusion','Women''s Leadership Training','4300-050-090-325','5800','Grants & Capacity Strengthening','2.2.5','ZMW',62400,0,31200,31200,0,0),
('KL-020','KaluluII','Strengthening Communities','Community Development','Community Needs Assessment','4300-050-090-325','5800','Grants & Capacity Strengthening','2.3.1','ZMW',38000,38000,0,0,0,0),
('KL-021','KaluluII','Strengthening Communities','Community Development','Youth Group Formation and Registration','4300-050-090-325','5800','Grants & Capacity Strengthening','2.3.2','ZMW',48000,12000,12000,12000,12000,0),
('KL-022','KaluluII','Strengthening Communities','Monitoring and Evaluation','Peer to peer learning visits','4300-050-090-325','5800','Grants & Capacity Strengthening','2.4.1','ZMW',38120,0,19060,19060,0,0),
('KL-023','KaluluII','Strengthening Communities','Monitoring and Evaluation','Monitoring and Compliance visits','4300-050-090-325','5800','Grants & Capacity Strengthening','2.4.1','ZMW',78080,19520,19520,19520,19520,0),
('KL-030','KaluluII','Strengthening Communities','Capacity Development','Skills Training for Youth Groups','4300-050-090-325','5800','Grants & Capacity Strengthening','2.3.3','ZMW',92000,0,46000,46000,0,0),
('KL-035','KaluluII','Building the Field of Community Philanthropy','CF Philanthropy Promotion','Community Philanthropy Awareness Campaigns','4300-050-090-325','5800','Grants & Capacity Strengthening','3.1.1','ZMW',129800,13650,51250,51250,13650,0),
('KL-040','KaluluII','Operations','Operational / Running costs','Overheads (7%) of Direct Costs','4300-050-090-325','5800','Operations / Running Costs','4.5.4','ZMW',78192.10,26443.90,27229.30,18794.30,5724.60,0),
('KL-041','KaluluII','Operations','Staff Costs','Staff Input','4300-050-090-320','5700','Staff Costs','4.5.4','ZMW',1917996.48,479499.12,517159.29,517159.29,517159.29,0),

-- ── ZGF (K1,104,500) ─────────────────────────────────────────────────────
('ZGF-001','ZGF','Operations','1. Organisational Governance','Convene ZGF AGM','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',45500,45500,0,0,0,0),
('ZGF-002','ZGF','Operations','2. Asset Management','Depreciation Charges','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',780000,195000,195000,195000,195000,0),
('ZGF-003','ZGF','Operations','3. Clear Old Outstanding Liabilities','Accrued liabilities - ZRA (25% penalties)','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',85000,0,85000,0,0,0),
('ZGF-004','ZGF','Operations','4. Clear Old Outstanding Liabilities','Accrued liabilities - Legal Fees','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',140000,35000,35000,35000,35000,0),
('ZGF-005','ZGF','Operations','5. Indirect Costs','General Overheads','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',42000,10500,10500,10500,10500,0),
('ZGF-006','ZGF','Operations','6. Bank Charges','Bank Charges - ZGF Corporate A/Cs','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',12000,3000,3000,3000,3000,0)

on conflict (id) do update set
  funding_source   = excluded.funding_source,
  strategic_pillar = excluded.strategic_pillar,
  objective        = excluded.objective,
  activity         = excluded.activity,
  budget_code      = excluded.budget_code,
  total_cost       = excluded.total_cost,
  q1 = excluded.q1, q2 = excluded.q2, q3 = excluded.q3, q4 = excluded.q4,
  updated_at       = now();

-- ── Reset initial spent from approved sample requests ────────────────────
-- (Trigger only fires on UPDATE, not INSERT — set manually for seed data)
update public.budget_lines set spent = 39000      where id = 'KL-001';
update public.budget_lines set spent = 21000      where id = 'KL-002';
update public.budget_lines set spent = 32100      where id = 'KL-010';
update public.budget_lines set spent = 45500      where id = 'ZGF-001';
update public.budget_lines set spent = 159833.04  where id = 'KL-041';
update public.budget_lines set spent = 390059.67  where id = 'MT-001';
update public.budget_lines set spent = 646184     where id = 'CR-033';
update public.budget_lines set spent = 130360     where id = 'MT-006';

-- Budget Summary validation (for reference)
-- Comic Relief total:  60,662,504.88
-- MOTTIII total:        3,504,858.00
-- KaluluII total:       3,226,199.08
-- ZGF total:            1,104,500.00
-- GRAND TOTAL:         68,540,561.96
