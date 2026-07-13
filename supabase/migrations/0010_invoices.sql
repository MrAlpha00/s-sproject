CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    subtotal NUMERIC NOT NULL,
    tax NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD' NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('paid', 'open', 'uncollectible', 'void')),
    payment_provider TEXT DEFAULT 'mock' NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoices organization access" ON invoices
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));
