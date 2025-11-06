-- Daily Site Inspector Schema
-- Tables for site inspections, photos, and checklists

-- Site Inspections Table
CREATE TABLE IF NOT EXISTS site_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location TEXT NOT NULL,
    weather TEXT,
    temperature TEXT,
    notes TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Photos Table
CREATE TABLE IF NOT EXISTS site_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES site_inspections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection Checklist Items Table
CREATE TABLE IF NOT EXISTS inspection_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES site_inspections(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE site_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_checklist_items ENABLE ROW LEVEL SECURITY;

-- Policies for site_inspections
CREATE POLICY "Users can view their own inspections" ON site_inspections 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inspections" ON site_inspections 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inspections" ON site_inspections 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inspections" ON site_inspections 
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for site_photos
CREATE POLICY "Users can view their own photos" ON site_photos 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own photos" ON site_photos 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON site_photos 
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for inspection_checklist_items
CREATE POLICY "Users can view checklist items for their inspections" ON inspection_checklist_items 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM site_inspections 
            WHERE site_inspections.id = inspection_checklist_items.inspection_id 
            AND site_inspections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create checklist items for their inspections" ON inspection_checklist_items 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM site_inspections 
            WHERE site_inspections.id = inspection_checklist_items.inspection_id 
            AND site_inspections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update checklist items for their inspections" ON inspection_checklist_items 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM site_inspections 
            WHERE site_inspections.id = inspection_checklist_items.inspection_id 
            AND site_inspections.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete checklist items for their inspections" ON inspection_checklist_items 
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM site_inspections 
            WHERE site_inspections.id = inspection_checklist_items.inspection_id 
            AND site_inspections.user_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_site_inspections_user_id ON site_inspections(user_id);
CREATE INDEX IF NOT EXISTS idx_site_inspections_date ON site_inspections(date);
CREATE INDEX IF NOT EXISTS idx_site_photos_inspection_id ON site_photos(inspection_id);
CREATE INDEX IF NOT EXISTS idx_site_photos_user_id ON site_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_inspection_checklist_items_inspection_id ON inspection_checklist_items(inspection_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_inspections_updated_at BEFORE UPDATE ON site_inspections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_checklist_items_updated_at BEFORE UPDATE ON inspection_checklist_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

