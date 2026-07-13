CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_name TEXT NOT NULL UNIQUE,
    description TEXT,
    monthly_price NUMERIC NOT NULL,
    yearly_price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    max_events INTEGER NOT NULL,
    max_translation_minutes INTEGER NOT NULL,
    max_characters INTEGER NOT NULL,
    max_listeners INTEGER NOT NULL,
    max_team_members INTEGER NOT NULL,
    storage_limit BIGINT NOT NULL,
    features JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscription plans select policy" ON subscription_plans
    FOR SELECT USING (is_active = true);

INSERT INTO subscription_plans (plan_name, description, monthly_price, yearly_price, max_events, max_translation_minutes, max_characters, max_listeners, max_team_members, storage_limit, features)
VALUES 
('Free', 'Basic translation trial', 0.00, 0.00, 3, 30, 50000, 5, 1, 1073741824, '{"analytics": false, "custom_voices": false, "streaming": true}'),
('Starter', 'For small events and meetups', 29.00, 290.00, 10, 120, 300000, 50, 3, 5368709120, '{"analytics": true, "custom_voices": false, "streaming": true}'),
('Professional', 'For conferences and enterprise events', 99.00, 990.00, 50, 1000, 3000000, 500, 10, 26843545600, '{"analytics": true, "custom_voices": true, "streaming": true}'),
('Enterprise', 'Unlimited access for large organizations', 299.00, 2990.00, 9999, 99999, 99999999, 99999, 100, 536870912000, '{"analytics": true, "custom_voices": true, "streaming": true}')
ON CONFLICT (plan_name) DO NOTHING;
