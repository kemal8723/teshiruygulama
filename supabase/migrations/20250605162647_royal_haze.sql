/*
  # Initial Database Schema

  1. New Tables
    - `stores`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `equipment`
      - `id` (uuid, primary key)
      - `name` (text)
      - `reference_image_url` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `submissions`
      - `id` (uuid, primary key)
      - `store_id` (uuid, foreign key)
      - `equipment_id` (uuid, foreign key)
      - `uploaded_image_url` (text)
      - `uploaded_image_filename` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, foreign key)
      - `manager_id` (text)
      - `manager_name` (text)
      - `is_correct` (boolean)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read stores"
  ON stores
  FOR SELECT
  TO authenticated
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

CREATE POLICY "Allow authenticated users to read equipment"
  ON equipment
  FOR SELECT
  TO authenticated
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

CREATE POLICY "Allow authenticated users to read submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow store users to update their submissions"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = store_id::text)
  WITH CHECK (auth.uid()::text = store_id::text);

CREATE POLICY "Allow store users to insert their submissions"
  ON submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = store_id::text);

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

CREATE POLICY "Allow authenticated users to read reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow managers to insert reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.claims_admin = true);

CREATE POLICY "Allow managers to update their reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.claims_admin = true AND manager_id = auth.uid()::text)
  WITH CHECK (auth.claims_admin = true AND manager_id = auth.uid()::text);