-- ==========================================
-- PERSONAL EXPENSE TRACKER - SUPABASE SETUP
-- ==========================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Automatic Profile Creation Trigger on auth.users Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Create Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT, -- Fallback / alias for description
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL,
    vendor TEXT,
    payment_method TEXT NOT NULL DEFAULT 'Online' CHECK (payment_method IN ('Online', 'Offline')),
    spent_for TEXT NOT NULL DEFAULT 'Self',
    is_recurring BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration Statements for Existing Database Tables
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS vendor TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS spent_for TEXT NOT NULL DEFAULT 'Self';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT true;

-- Enable RLS on Expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Expenses RLS Policies
CREATE POLICY "Users can view own expenses"
    ON public.expenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
    ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
    ON public.expenses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
    ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- 5. Create Custom Options Table (For user-created categories, vendors, etc.)
CREATE TABLE IF NOT EXISTS public.custom_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL, -- 'category' or 'vendor'
    option_value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_field_option UNIQUE (user_id, field_name, option_value)
);

-- Enable RLS on Custom Options
ALTER TABLE public.custom_options ENABLE ROW LEVEL SECURITY;

-- Custom Options RLS Policies
CREATE POLICY "Users can view own custom_options"
    ON public.custom_options FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom_options"
    ON public.custom_options FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom_options"
    ON public.custom_options FOR DELETE USING (auth.uid() = user_id);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON public.expenses (user_id, category);
CREATE INDEX IF NOT EXISTS idx_expenses_user_payment ON public.expenses (user_id, payment_method);
CREATE INDEX IF NOT EXISTS idx_expenses_user_recurring ON public.expenses (user_id, is_recurring);
CREATE INDEX IF NOT EXISTS idx_custom_options_user_field ON public.custom_options (user_id, field_name);

-- 7. Monthly Cron Job Setup (Runs on the 1st of every month at midnight UTC)
SELECT cron.schedule(
    'monthly-expense-report',
    '0 0 1 * *',
    $$
    SELECT net.http_post(
        url := 'https://your-domain.vercel.app/api/cron/monthly-report',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_CRON_SECRET'
        ),
        body := '{}'::jsonb
    );
    $$
);
