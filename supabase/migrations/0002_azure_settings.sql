-- Create Azure Settings metadata table without storing subscription keys

CREATE TABLE IF NOT EXISTS azure_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    speech_region TEXT DEFAULT 'eastus' NOT NULL,
    translator_region TEXT DEFAULT 'global' NOT NULL,
    enabled BOOLEAN DEFAULT FALSE NOT NULL,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    connection_status TEXT DEFAULT 'Pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID
);

-- Enable RLS
ALTER TABLE azure_settings ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Policies
CREATE POLICY "Azure settings access policy" ON azure_settings
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
