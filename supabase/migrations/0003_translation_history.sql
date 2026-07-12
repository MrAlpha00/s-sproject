-- Create Translation Messages Table for persisting translation history

CREATE TABLE IF NOT EXISTS translation_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES translation_sessions(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    translated_text JSONB DEFAULT '{}'::jsonb NOT NULL,
    source_language TEXT NOT NULL,
    target_languages TEXT[] DEFAULT '{}'::text[] NOT NULL,
    provider TEXT NOT NULL,
    confidence NUMERIC,
    recognition_latency INTEGER DEFAULT 0 NOT NULL,
    translation_latency INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE translation_messages ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation RLS Policies
CREATE POLICY "Translation messages access policy" ON translation_messages
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
