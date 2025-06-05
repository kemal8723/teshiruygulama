/*
  # Initial Schema Setup

  1. New Tables
    - equipment (id, name, reference_image_url, description, created_at)
    - stores (id, name, created_at)
    - submissions (id, store_id, equipment_id, uploaded_image_url, uploaded_image_filename, status, created_at, updated_at)
    - reviews (id, submission_id, manager_id, manager_name, is_correct, notes, created_at, updated_at)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public read access and specific write permissions
    
  3. Triggers
    - Add updated_at triggers for submissions and reviews tables
*/

-- Equipment tablosu
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  reference_image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stores tablosu
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Submissions tablosu
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  uploaded_image_url TEXT,
  uploaded_image_filename TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'partial_review')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, equipment_id)
);

-- Reviews tablosu
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  manager_id TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for submissions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_submissions_updated_at') THEN
    CREATE TRIGGER update_submissions_updated_at
      BEFORE UPDATE ON submissions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Trigger for reviews
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reviews_updated_at') THEN
    CREATE TRIGGER update_reviews_updated_at
      BEFORE UPDATE ON reviews
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access for equipment" ON equipment;
DROP POLICY IF EXISTS "Public read access for stores" ON stores;
DROP POLICY IF EXISTS "Public read access for submissions" ON submissions;
DROP POLICY IF EXISTS "Store submissions insert policy" ON submissions;
DROP POLICY IF EXISTS "Store submissions update policy" ON submissions;
DROP POLICY IF EXISTS "Public read access for reviews" ON reviews;
DROP POLICY IF EXISTS "Public insert access for reviews" ON reviews;
DROP POLICY IF EXISTS "Manager update policy for reviews" ON reviews;

-- Create RLS Policies
CREATE POLICY "Public read access for equipment" ON equipment FOR SELECT TO public USING (true);
CREATE POLICY "Public read access for stores" ON stores FOR SELECT TO public USING (true);
CREATE POLICY "Public read access for submissions" ON submissions FOR SELECT TO public USING (true);
CREATE POLICY "Store submissions insert policy" ON submissions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Store submissions update policy" ON submissions FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public read access for reviews" ON reviews FOR SELECT TO public USING (true);
CREATE POLICY "Public insert access for reviews" ON reviews FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Manager update policy for reviews" ON reviews FOR UPDATE TO public USING (manager_id = current_user) WITH CHECK (manager_id = current_user);