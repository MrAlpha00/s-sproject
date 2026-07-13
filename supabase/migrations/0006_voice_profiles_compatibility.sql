-- Alter voice_profiles table to support operator configurations
ALTER TABLE voice_profiles ADD COLUMN IF NOT EXISTS profile_name TEXT;
ALTER TABLE voice_profiles ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'azure' NOT NULL;
ALTER TABLE voice_profiles ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE voice_profiles ADD COLUMN IF NOT EXISTS voice_name TEXT;
ALTER TABLE voice_profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE voice_profiles ADD COLUMN IF NOT EXISTS style TEXT;
ALTER TABLE voice_profiles ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false NOT NULL;
