ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS image_url text;
