-- Create templates table for persistent storage
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  elements JSONB NOT NULL DEFAULT '[]',
  page_size TEXT NOT NULL DEFAULT 'A4',
  orientation TEXT NOT NULL DEFAULT 'portrait',
  layout_type TEXT NOT NULL DEFAULT 'document',
  source_app TEXT,
  external_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX idx_templates_external_id ON public.templates(external_id);
CREATE INDEX idx_templates_source_app ON public.templates(source_app);

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Allow public read access for API sync (validated by edge function)
CREATE POLICY "Allow public read" ON public.templates FOR SELECT USING (true);

-- Allow API writes (validated by edge function auth)
CREATE POLICY "Allow API inserts" ON public.templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow API updates" ON public.templates FOR UPDATE USING (true);
CREATE POLICY "Allow API deletes" ON public.templates FOR DELETE USING (true);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.update_templates_updated_at();