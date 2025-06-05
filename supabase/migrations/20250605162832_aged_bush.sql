/*
  # Initial Schema Setup
  
  1. New Tables
    - stores: Store information
    - equipment: Display equipment details
    - submissions: Store uploads
    - reviews: Manager reviews
  
  2. Security
    - Enable RLS on all tables
    - Set up appropriate access policies
*/

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for stores"
  ON stores
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  reference_image_url text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for equipment"
  ON equipment
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  uploaded_image_url text,
  uploaded_image_filename text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'partial_review')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, equipment_id)
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for submissions"
  ON submissions
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Store submissions insert policy"
  ON submissions
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Store submissions update policy"
  ON submissions
  FOR UPDATE
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE NOT NULL,
  manager_id text NOT NULL,
  manager_name text NOT NULL,
  is_correct boolean NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for reviews"
  ON reviews
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Public insert access for reviews"
  ON reviews
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Manager update policy for reviews"
  ON reviews
  FOR UPDATE
  TO PUBLIC
  USING (manager_id = current_user)
  WITH CHECK (manager_id = current_user);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to submissions
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();