-- =========================================================
-- SPENDWISE - SUPABASE CRON JOBS SETUP SCRIPT (pg_cron)
-- =========================================================
-- Copy and run these SQL statements in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Grant cron permissions to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- 3. Schedule Cron Job 1: Transaction Milestones Check (Runs every 15 minutes)
SELECT cron.schedule(
    'spendwise-milestone-reports',
    '*/15 * * * *',
    $$
    SELECT net.http_post(
        url := 'https://YOUR-APP-DOMAIN.vercel.app/api/cron/milestone-report',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_CRON_SECRET'
        ),
        body := '{}'::jsonb
    );
    $$
);

-- 4. Schedule Cron Job 2: Daily Expense Report (Runs every midnight UTC)
SELECT cron.schedule(
    'spendwise-daily-reports',
    '0 0 * * *',
    $$
    SELECT net.http_post(
        url := 'https://YOUR-APP-DOMAIN.vercel.app/api/cron/report-scheduler?frequency=Daily',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_CRON_SECRET'
        ),
        body := '{}'::jsonb
    );
    $$
);

-- 5. Schedule Cron Job 3: Weekly Expense Report (Runs every Monday at 08:00 UTC)
SELECT cron.schedule(
    'spendwise-weekly-reports',
    '0 8 * * 1',
    $$
    SELECT net.http_post(
        url := 'https://YOUR-APP-DOMAIN.vercel.app/api/cron/report-scheduler?frequency=Weekly',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_CRON_SECRET'
        ),
        body := '{}'::jsonb
    );
    $$
);

-- 6. Schedule Cron Job 4: Monthly Expense Report (Runs on the 1st of every month at midnight UTC)
SELECT cron.schedule(
    'spendwise-monthly-reports',
    '0 0 1 * *',
    $$
    SELECT net.http_post(
        url := 'https://YOUR-APP-DOMAIN.vercel.app/api/cron/report-scheduler?frequency=Monthly',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_CRON_SECRET'
        ),
        body := '{}'::jsonb
    );
    $$
);

-- Useful Query: View active scheduled cron jobs in Supabase
-- SELECT * FROM cron.job;
