-- Create marketing_projects table
CREATE TABLE public.marketing_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  instagram_caption TEXT,
  email_subject TEXT,
  email_body TEXT,
  landing_headline TEXT,
  landing_cta TEXT,
  linkedin_post TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.marketing_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can view/create/update/delete)
CREATE POLICY "Allow public read access" 
ON public.marketing_projects 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access" 
ON public.marketing_projects 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access" 
ON public.marketing_projects 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access" 
ON public.marketing_projects 
FOR DELETE 
USING (true);