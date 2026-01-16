-- Supabase Schema for Camaral Presentations

-- Create presentations table
CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  slide_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for slide images
INSERT INTO storage.buckets (id, name, public)
VALUES ('slides', 'slides', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Presentations policies
CREATE POLICY "Users can view their own presentations"
  ON presentations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentations"
  ON presentations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentations"
  ON presentations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentations"
  ON presentations FOR DELETE
  USING (auth.uid() = user_id);

-- Slides policies
CREATE POLICY "Users can view slides from their presentations"
  ON slides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM presentations
      WHERE presentations.id = slides.presentation_id
      AND presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert slides to their presentations"
  ON slides FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM presentations
      WHERE presentations.id = slides.presentation_id
      AND presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update slides from their presentations"
  ON slides FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM presentations
      WHERE presentations.id = slides.presentation_id
      AND presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete slides from their presentations"
  ON slides FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM presentations
      WHERE presentations.id = slides.presentation_id
      AND presentations.user_id = auth.uid()
    )
  );

-- Storage policies for slides bucket
CREATE POLICY "Users can upload slides"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'slides' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view slides"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'slides');

CREATE POLICY "Users can update their own slides"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'slides' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own slides"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'slides' AND auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_slides_presentation_id ON slides(presentation_id);
CREATE INDEX IF NOT EXISTS idx_slides_order ON slides(presentation_id, slide_order);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for presentations updated_at
CREATE TRIGGER update_presentations_updated_at
  BEFORE UPDATE ON presentations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
