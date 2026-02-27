-- ============================================================
-- ZGF Smart Budget Tracker — Seed Data
-- Run AFTER schema.sql in your Supabase SQL Editor
-- ============================================================

insert into public.budget_lines (id, funding_source, strategic_pillar, objective, activity, budget_code, odoo_code, odoo_category, zgf_code, currency, total_cost, q1, q2, q3, q4, spent)
values
  -- KaluluII — Civic Education
  ('KL-001','KaluluII','Civic Education and Voter Information','Civic Education & Voter Information','Ward Based Civic Education','4300-050-090-325','5800','Grants & Capacity Strengthening','2.1.1','ZMW',156000,39000,39000,39000,39000,0),
  ('KL-002','KaluluII','Civic Education and Voter Information','Civic Education & Voter Information','Community Radio Broadcasts on Civic Issues','4300-050-090-325','5800','Grants & Capacity Strengthening','2.1.2','ZMW',84000,21000,21000,21000,21000,0),
  ('KL-003','KaluluII','Civic Education and Voter Information','Civic Education & Voter Information','Production of Civic Education IEC materials','4300-050-090-325','5800','Grants & Capacity Strengthening','2.1.3','ZMW',45000,45000,0,0,0,0),
  ('KL-004','KaluluII','Civic Education and Voter Information','Civic Education & Voter Information','Youth Civic Engagement Camps','4300-050-090-325','5800','Grants & Capacity Strengthening','2.1.4','ZMW',95000,0,47500,47500,0,0),
  ('KL-005','KaluluII','Civic Education and Voter Information','Voter Education & Registration Support','Voter Registration Support Drives','4300-050-090-325','5800','Grants & Capacity Strengthening','2.1.5','ZMW',112000,0,56000,56000,0,0),
  -- KaluluII — Democratic Governance
  ('KL-010','KaluluII','Democratic Governance and Human Rights','Governance Strengthening','Ward Development Committee Capacity Building','4300-050-090-325','5800','Grants & Capacity Strengthening','2.2.1','ZMW',128400,32100,32100,32100,32100,0),
  ('KL-011','KaluluII','Democratic Governance and Human Rights','Governance Strengthening','Community Accountability Forums','4300-050-090-325','5800','Grants & Capacity Strengthening','2.2.2','ZMW',76800,19200,19200,19200,19200,0),
  ('KL-012','KaluluII','Democratic Governance and Human Rights','Human Rights Promotion','Human Rights Awareness Workshops','4300-050-090-325','5800','Grants & Capacity Strengthening','2.2.3','ZMW',54000,13500,13500,13500,13500,0),
  ('KL-013','KaluluII','Democratic Governance and Human Rights','Human Rights Promotion','Legal Aid Clinics for Vulnerable Communities','4300-050-090-325','5800','Grants & Capacity Strengthening','2.2.4','ZMW',88000,22000,22000,22000,22000,0),
  ('KL-014','KaluluII','Democratic Governance and Human Rights','Gender and Social Inclusion','Women''s Leadership Training','4300-050-090-325','5800','Grants & Capacity Strengthening','2.2.5','ZMW',62400,0,31200,31200,0,0),
  -- KaluluII — Strengthening Communities
  ('KL-020','KaluluII','Strengthening Communities','Community Development','Community Needs Assessment','4300-050-090-325','5800','Grants & Capacity Strengthening','2.3.1','ZMW',38000,38000,0,0,0,0),
  ('KL-021','KaluluII','Strengthening Communities','Community Development','Youth Group Formation and Registration','4300-050-090-325','5800','Grants & Capacity Strengthening','2.3.2','ZMW',48000,12000,12000,12000,12000,0),
  ('KL-022','KaluluII','Strengthening Communities','Monitoring and Evaluation','Peer to peer learning visits','4300-050-090-325','5800','Grants & Capacity Strengthening','2.4.1','ZMW',38120,0,19060,19060,0,0),
  ('KL-023','KaluluII','Strengthening Communities','Monitoring and Evaluation','Monitoring and Compliance visits','4300-050-090-325','5800','Grants & Capacity Strengthening','2.4.1','ZMW',78080,19520,19520,19520,19520,0),
  ('KL-030','KaluluII','Strengthening Communities','Capacity Development','Skills Training for Youth Groups','4300-050-090-325','5800','Grants & Capacity Strengthening','2.3.3','ZMW',92000,0,46000,46000,0,0),
  -- KaluluII — Operations
  ('KL-040','KaluluII','Operations','Operational / Running costs','Overheads (7%) of Direct Costs','4300-050-090-325','5800','Operations / Running Costs','4.5.4','ZMW',78192.10,26443.90,27229.30,18794.30,5724.60,0),
  ('KL-041','KaluluII','Operations','Staff Costs','Staff Input','4300-050-090-320','5700','Staff Costs','4.5.4','ZMW',1917996.48,479499.12,517159.29,517159.29,517159.29,0),
  -- ZGF
  ('ZGF-001','ZGF','Operations','1. Organisational Governance','Convene ZGF AGM','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',45500,45500,0,0,0,0),
  ('ZGF-002','ZGF','Operations','2. Asset Management','Depreciation Charges','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',780000,195000,195000,195000,195000,0),
  ('ZGF-003','ZGF','Operations','3. Clear Old Outstanding Liabilities','Accrued liabilities - ZRA (25% penalties)','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',85000,0,85000,0,0,0),
  ('ZGF-004','ZGF','Operations','4. Clear Old Outstanding Liabilities','Accrued liabilities - Legal Fees','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',140000,35000,35000,35000,35000,0),
  ('ZGF-005','ZGF','Operations','5. Indirect Costs','General Overheads','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',42000,10500,10500,10500,10500,0),
  ('ZGF-006','ZGF','Operations','6. Bank Charges','Bank Charges - ZGF Corporate A/Cs','4300-050-090-325','5800','Operations / Running Costs','4.1.4','ZMW',12000,3000,3000,3000,3000,0)
on conflict (id) do update set
  total_cost = excluded.total_cost,
  q1 = excluded.q1, q2 = excluded.q2, q3 = excluded.q3, q4 = excluded.q4,
  updated_at = now();

-- Sample payment requests (SharePoint will override these once synced)
insert into public.payment_requests (id, sharepoint_id, name, budget_code, budget_line_id, year, amount, requested_by, status, date)
values
  ('PR-2026-001',1,'Ward Civic Education Materials Q1','4300-050-090-325','KL-001',2026,39000,'Manager CLD','Approved','2026-01-15'),
  ('PR-2026-002',2,'Community Radio Broadcast Jan-Feb','4300-050-090-325','KL-002',2026,21000,'Programme Officer','Approved','2026-01-20'),
  ('PR-2026-003',3,'IEC Materials Production','4300-050-090-325','KL-003',2026,45000,'Communications Officer','Pending','2026-02-01'),
  ('PR-2026-004',4,'WDC Capacity Building Q1','4300-050-090-325','KL-010',2026,32100,'Manager CLD','Approved','2026-02-05'),
  ('PR-2026-005',5,'ZGF AGM Sitting Allowances','4300-050-090-325','ZGF-001',2026,45500,'CEO','Approved','2026-01-10'),
  ('PR-2026-006',6,'Youth Engagement Camp Venue Q2','4300-050-090-325','KL-004',2026,47500,'Youth Programme Officer','Pending','2026-02-18'),
  ('PR-2026-007',7,'Human Rights Workshop Materials','4300-050-090-325','KL-012',2026,13500,'HR Officer','Rejected','2026-02-10'),
  ('PR-2026-008',8,'Staff Input - January','4300-050-090-320','KL-041',2026,159833.04,'HoF','Approved','2026-01-31')
on conflict (id) do nothing;

-- Manually set the initial spent amounts for the seed approved requests
-- (The trigger only fires on UPDATE, not INSERT)
update public.budget_lines set spent = 39000    where id = 'KL-001';
update public.budget_lines set spent = 21000    where id = 'KL-002';
update public.budget_lines set spent = 32100    where id = 'KL-010';
update public.budget_lines set spent = 45500    where id = 'ZGF-001';
update public.budget_lines set spent = 159833.04 where id = 'KL-041';
