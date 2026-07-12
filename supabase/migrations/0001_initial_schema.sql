-- Create Tables with organization_id and Row Level Security (RLS)

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    settings JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID
);

-- 2. Profiles (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    role TEXT DEFAULT 'VIEWER' NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'EVENT_MANAGER', 'OPERATOR', 'VIEWER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID
);

-- 3. Translation Events
CREATE TABLE IF NOT EXISTS translation_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    venue TEXT,
    date TEXT,
    time TEXT,
    source_language TEXT NOT NULL,
    target_languages TEXT[] DEFAULT '{}'::text[] NOT NULL,
    translation_model TEXT NOT NULL,
    latency_mode TEXT NOT NULL CHECK (latency_mode IN ('low-latency', 'standard', 'high-fidelity')),
    profanity_filter BOOLEAN DEFAULT TRUE NOT NULL,
    target_vocabulary TEXT,
    input_device TEXT,
    output_device TEXT,
    voice_profile TEXT,
    status TEXT DEFAULT 'scheduled' NOT NULL CHECK (status IN ('draft', 'scheduled', 'live', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID
);

-- 4. Translation Sessions
CREATE TABLE IF NOT EXISTS translation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES translation_events(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'idle' NOT NULL CHECK (status IN ('idle', 'testing', 'active', 'paused', 'stopped')),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0 NOT NULL,
    listeners_count INTEGER DEFAULT 0 NOT NULL,
    expected_latency TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID
);

-- 5. Voice Profiles
CREATE TABLE IF NOT EXISTS voice_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    elevenlabs_voice_id TEXT,
    status TEXT DEFAULT 'inactive' NOT NULL CHECK (status IN ('active', 'training', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID
);

-- 6. Audio Configurations
CREATE TABLE IF NOT EXISTS audio_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('input', 'output')),
    sample_rate TEXT DEFAULT '48.0 kHz' NOT NULL,
    channels TEXT DEFAULT 'Stereo (2 Ch)' NOT NULL,
    latency TEXT DEFAULT '10ms' NOT NULL,
    input_gain INTEGER DEFAULT 100 NOT NULL,
    output_gain INTEGER DEFAULT 100 NOT NULL,
    volume INTEGER DEFAULT 100 NOT NULL,
    mute BOOLEAN DEFAULT FALSE NOT NULL,
    monitoring BOOLEAN DEFAULT FALSE NOT NULL,
    test_tone BOOLEAN DEFAULT FALSE NOT NULL,
    noise_suppression BOOLEAN DEFAULT FALSE NOT NULL,
    echo_cancellation BOOLEAN DEFAULT FALSE NOT NULL,
    auto_gain BOOLEAN DEFAULT FALSE NOT NULL,
    buffer_size TEXT DEFAULT '256' NOT NULL,
    bit_depth TEXT DEFAULT '24' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID
);

-- 7. API Usages
CREATE TABLE IF NOT EXISTS api_usages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    service_name TEXT NOT NULL CHECK (service_name IN ('AzureSpeech', 'AzureTranslator', 'ElevenLabs')),
    units_used NUMERIC DEFAULT 0 NOT NULL,
    cost_est NUMERIC DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID
);

-- 8. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- Profiles: Users can view profiles in their own organization. Users can update their own profile.
CREATE POLICY "Profiles select policy" ON profiles
    FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Profiles update policy" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Organizations: Users can view their own organization. Admins can update it.
CREATE POLICY "Organizations select policy" ON organizations
    FOR SELECT USING (id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Organizations update policy" ON organizations
    FOR UPDATE USING (id = (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ORGANIZATION_ADMIN')));

-- Translation Events
CREATE POLICY "Translation events access policy" ON translation_events
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Translation Sessions
CREATE POLICY "Translation sessions access policy" ON translation_sessions
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Voice Profiles
CREATE POLICY "Voice profiles access policy" ON voice_profiles
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Audio Configurations
CREATE POLICY "Audio configurations access policy" ON audio_configurations
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- API Usages
CREATE POLICY "API usages access policy" ON api_usages
    FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Subscriptions
CREATE POLICY "Subscriptions access policy" ON subscriptions
    FOR SELECT USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
