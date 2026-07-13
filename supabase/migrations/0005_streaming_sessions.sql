-- Create Streaming Sessions Table
CREATE TABLE IF NOT EXISTS streaming_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    operator_id UUID NOT NULL,
    event_id UUID REFERENCES translation_events(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'idle' NOT NULL CHECK (status IN ('idle', 'testing', 'active', 'paused', 'stopped')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    ended_at TIMESTAMP WITH TIME ZONE,
    audience_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on streaming_sessions
ALTER TABLE streaming_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for streaming_sessions
CREATE POLICY "Operators full access to streaming_sessions" ON streaming_sessions
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Public read access to active streaming_sessions" ON streaming_sessions
    FOR SELECT USING (status = 'active');

-- Allow public read access to live or scheduled translation_events (for listener portal)
CREATE POLICY "Public read access to active translation_events" ON translation_events
    FOR SELECT USING (status = 'live' OR status = 'scheduled');

-- Allow public read access to organizations (for listener portal)
CREATE POLICY "Public read access to organizations" ON organizations
    FOR SELECT USING (true);
