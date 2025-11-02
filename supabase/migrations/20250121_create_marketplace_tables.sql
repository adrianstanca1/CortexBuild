-- Create marketplace_apps table
CREATE TABLE IF NOT EXISTS public.marketplace_apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'other' CHECK (category IN ('productivity', 'communication', 'analytics', 'integration', 'utility', 'other')),
    developer_id TEXT NOT NULL,
    version TEXT NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0,
    pricing_model TEXT DEFAULT 'free' CHECK (pricing_model IN ('free', 'one_time', 'subscription')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published', 'suspended')),
    icon_url TEXT,
    screenshots TEXT[],
    features TEXT[],
    requirements TEXT,
    install_count INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create app_installations table
CREATE TABLE IF NOT EXISTS public.app_installations (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    company_id TEXT NOT NULL,
    installed_by TEXT NOT NULL,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'uninstalled')),
    uninstalled_at TIMESTAMP WITH TIME ZONE
);

-- Create app_reviews table
CREATE TABLE IF NOT EXISTS public.app_reviews (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create developer_earnings table
CREATE TABLE IF NOT EXISTS public.developer_earnings (
    id TEXT PRIMARY KEY,
    developer_id TEXT NOT NULL,
    app_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    transaction_type TEXT DEFAULT 'purchase' CHECK (transaction_type IN ('purchase', 'subscription', 'commission')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_developer_id ON public.marketplace_apps(developer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_status ON public.marketplace_apps(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_category ON public.marketplace_apps(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_rating ON public.marketplace_apps(rating DESC);

CREATE INDEX IF NOT EXISTS idx_app_installations_app_id ON public.app_installations(app_id);
CREATE INDEX IF NOT EXISTS idx_app_installations_company_id ON public.app_installations(company_id);
CREATE INDEX IF NOT EXISTS idx_app_installations_status ON public.app_installations(status);

CREATE INDEX IF NOT EXISTS idx_app_reviews_app_id ON public.app_reviews(app_id);
CREATE INDEX IF NOT EXISTS idx_app_reviews_user_id ON public.app_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_app_reviews_rating ON public.app_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_developer_earnings_developer_id ON public.developer_earnings(developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_earnings_app_id ON public.developer_earnings(app_id);
CREATE INDEX IF NOT EXISTS idx_developer_earnings_status ON public.developer_earnings(status);

-- Enable RLS
ALTER TABLE public.marketplace_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_earnings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view published apps"
    ON public.marketplace_apps FOR SELECT
    USING (status = 'published' OR developer_id = auth.uid()::text);

CREATE POLICY "Developers can create apps"
    ON public.marketplace_apps FOR INSERT
    WITH CHECK (developer_id = auth.uid()::text);

CREATE POLICY "Developers can update their own apps"
    ON public.marketplace_apps FOR UPDATE
    USING (developer_id = auth.uid()::text);

CREATE POLICY "Admins can manage all apps"
    ON public.marketplace_apps FOR ALL
    USING (true);

CREATE POLICY "Users can view installations"
    ON public.app_installations FOR SELECT
    USING (true);

CREATE POLICY "Users can install apps"
    ON public.app_installations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view reviews"
    ON public.app_reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can create reviews"
    ON public.app_reviews FOR INSERT
    WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update their own reviews"
    ON public.app_reviews FOR UPDATE
    USING (user_id = auth.uid()::text);

CREATE POLICY "Developers can view their earnings"
    ON public.developer_earnings FOR SELECT
    USING (developer_id = auth.uid()::text);

CREATE POLICY "Admins can manage earnings"
    ON public.developer_earnings FOR ALL
    USING (true);

