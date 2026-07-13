-- Create Audio Setup Profiles table
CREATE TABLE IF NOT EXISTS audio_setup_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    profile_name TEXT NOT NULL,
    input_device TEXT DEFAULT 'default' NOT NULL,
    output_device TEXT DEFAULT 'default' NOT NULL,
    source_language TEXT DEFAULT 'en-US' NOT NULL,
    target_languages TEXT[] DEFAULT '{}'::text[] NOT NULL,
    voice_selection JSONB DEFAULT '{}'::jsonb NOT NULL,
    azure_region TEXT DEFAULT 'centralindia' NOT NULL,
    audio_settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID
);

-- Enable RLS
ALTER TABLE audio_setup_profiles ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY "Audio setup profiles access policy" ON audio_setup_profiles
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
