/*
# AgriGrow Africa Initial Schema

1. New Tables
- `profiles` - User profile data extending auth.users
  - id (uuid, PK, refs auth.users)
  - name, phone, avatar, role, country, province, language, onboarding_complete
- `farms` - User farms
  - id (uuid, PK)
  - user_id (uuid, refs auth.users)
  - name, size, size_unit, province, country, soil_type, water_source, image
- `crops` - Crop records belonging to farms
  - id (uuid, PK)
  - farm_id (uuid, refs farms)
  - name, variety, planted_date, expected_harvest_date, area, area_unit, status, health_score, icon
- `livestock` - Livestock records belonging to farms
  - id (uuid, PK)
  - farm_id (uuid, refs farms)
  - type, breed, count, health_status
- `tasks` - Planner tasks
  - id (uuid, PK)
  - user_id (uuid, refs auth.users)
  - title, description, due_date, category, status, priority
- `notifications` - User notifications
  - id (uuid, PK)
  - user_id (uuid, refs auth.users)
  - type, title, message, read, priority, icon
- `disease_detections` - AI disease scan results
  - id (uuid, PK)
  - user_id (uuid, refs auth.users)
  - image_url, crop_type, disease, confidence, severity, treatment, recommendations
- `marketplace_listings` - Marketplace items
  - id (uuid, PK)
  - user_id (uuid, refs auth.users)
  - title, description, price, currency, unit, category, location, image, rating, reviews, stock, verified

2. Security
- Enable RLS on all tables
- Owner-scoped policies for authenticated users
- Cascade deletes on foreign keys

3. Indexes
- user_id on all user-owned tables
- farm_id on crops and livestock
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  avatar text,
  role text NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin', 'expert')),
  country text NOT NULL DEFAULT 'South Africa',
  province text,
  language text NOT NULL DEFAULT 'en',
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Farms table
CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  size numeric NOT NULL,
  size_unit text NOT NULL DEFAULT 'ha' CHECK (size_unit IN ('ha', 'acres')),
  province text,
  country text DEFAULT 'South Africa',
  soil_type text,
  water_source text,
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_farms" ON farms;
CREATE POLICY "select_own_farms" ON farms FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_farms" ON farms;
CREATE POLICY "insert_own_farms" ON farms FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_farms" ON farms;
CREATE POLICY "update_own_farms" ON farms FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_farms" ON farms;
CREATE POLICY "delete_own_farms" ON farms FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name text NOT NULL,
  variety text,
  planted_date date,
  expected_harvest_date date,
  area numeric NOT NULL,
  area_unit text NOT NULL DEFAULT 'ha' CHECK (area_unit IN ('ha', 'acres')),
  status text NOT NULL DEFAULT 'planted' CHECK (status IN ('planted', 'growing', 'ready', 'harvested')),
  health_score integer NOT NULL DEFAULT 80 CHECK (health_score >= 0 AND health_score <= 100),
  icon text DEFAULT 'grass',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_crops" ON crops;
CREATE POLICY "select_own_crops" ON crops FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crops.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_crops" ON crops;
CREATE POLICY "insert_own_crops" ON crops FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crops.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_crops" ON crops;
CREATE POLICY "update_own_crops" ON crops FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crops.farm_id AND farms.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crops.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_crops" ON crops;
CREATE POLICY "delete_own_crops" ON crops FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = crops.farm_id AND farms.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON crops(farm_id);

-- Livestock table
CREATE TABLE IF NOT EXISTS livestock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  type text NOT NULL,
  breed text,
  count integer NOT NULL DEFAULT 1,
  health_status text NOT NULL DEFAULT 'good' CHECK (health_status IN ('good', 'fair', 'poor')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_livestock" ON livestock;
CREATE POLICY "select_own_livestock" ON livestock FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_livestock" ON livestock;
CREATE POLICY "insert_own_livestock" ON livestock FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_livestock" ON livestock;
CREATE POLICY "update_own_livestock" ON livestock FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock.farm_id AND farms.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock.farm_id AND farms.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_livestock" ON livestock;
CREATE POLICY "delete_own_livestock" ON livestock FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = livestock.farm_id AND farms.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_livestock_farm_id ON livestock(farm_id);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('planting', 'irrigation', 'harvesting', 'spraying', 'fertilizing', 'other')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'done')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  farm_id uuid REFERENCES farms(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('weather', 'disease', 'market', 'planner', 'ai', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  icon text NOT NULL DEFAULT 'notifications',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Disease detections table
CREATE TABLE IF NOT EXISTS disease_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  crop_type text NOT NULL,
  disease text NOT NULL,
  confidence integer NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  treatment text[] NOT NULL DEFAULT '{}',
  recommendations text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE disease_detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_detections" ON disease_detections;
CREATE POLICY "select_own_detections" ON disease_detections FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_detections" ON disease_detections;
CREATE POLICY "insert_own_detections" ON disease_detections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_detections" ON disease_detections;
CREATE POLICY "delete_own_detections" ON disease_detections FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_disease_detections_user_id ON disease_detections(user_id);

-- Marketplace listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ZAR',
  unit text NOT NULL,
  category text NOT NULL CHECK (category IN ('produce', 'inputs', 'equipment', 'services')),
  location text,
  image text,
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_listings" ON marketplace_listings;
CREATE POLICY "select_all_listings" ON marketplace_listings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_listings" ON marketplace_listings;
CREATE POLICY "insert_own_listings" ON marketplace_listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_listings" ON marketplace_listings;
CREATE POLICY "update_own_listings" ON marketplace_listings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_listings" ON marketplace_listings;
CREATE POLICY "delete_own_listings" ON marketplace_listings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_user_id ON marketplace_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON marketplace_listings(category);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
DO $$
BEGIN
  CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TRIGGER update_livestock_updated_at BEFORE UPDATE ON livestock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN NULL;
END;
$$;

DO $$
BEGIN
  CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN NULL;
END;
$$;