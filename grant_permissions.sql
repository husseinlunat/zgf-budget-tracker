-- Run this in your Supabase SQL Editor to grant explicit permissions and fix the schema cache

-- 1. Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant all privileges on the tables to the necessary roles
GRANT ALL ON TABLE public.payment_requests TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.budget_lines TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.deductions TO anon, authenticated, service_role;

-- 3. Force the API to reload the schema and recognize the permissions
NOTIFY pgrst, 'reload schema';
