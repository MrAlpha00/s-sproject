CREATE TABLE IF NOT EXISTS usage_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
    current_events INTEGER DEFAULT 0 NOT NULL,
    translation_minutes_used INTEGER DEFAULT 0 NOT NULL,
    characters_used INTEGER DEFAULT 0 NOT NULL,
    listeners_used INTEGER DEFAULT 0 NOT NULL,
    storage_used BIGINT DEFAULT 0 NOT NULL,
    team_members_used INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usage limits organization access" ON usage_limits
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
