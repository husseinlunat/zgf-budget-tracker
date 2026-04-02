-- Run this in your Supabase SQL Editor to allow the UI to read the data

-- 1. Disable RLS or create a public read policy for payment_requests
ALTER TABLE public.payment_requests DISABLE ROW LEVEL SECURITY;

-- 2. Do the same for budget_lines
ALTER TABLE public.budget_lines DISABLE ROW LEVEL SECURITY;

-- 3. Also for deductions
ALTER TABLE public.deductions DISABLE ROW LEVEL SECURITY;
