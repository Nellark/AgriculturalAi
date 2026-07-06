/*
# Add crop_prices table

1. New Tables
- `crop_prices` - Market price data for crops
  - id (uuid, PK)
  - name (text, crop name)
  - price (numeric, current price)
  - unit (text, pricing unit e.g. 'kg', 'ton')
  - currency (text, default 'ZAR')
  - change (numeric, price change amount)
  - change_percent (numeric, percentage change)
  - market (text, market source)
  - trend (text, 'up', 'down', 'stable')
  - last_updated (timestamptz)
  - created_at (timestamptz)

2. Security
- Enable RLS on crop_prices
- Allow all authenticated users to read (public market data)
- Only service role can insert/update (populated by external API/edge function)

3. Notes
- This table stores market price data that can be populated by an external API
- Users can read prices but not modify them (read-only for users)
*/

CREATE TABLE IF NOT EXISTS crop_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  currency text NOT NULL DEFAULT 'ZAR',
  change numeric NOT NULL DEFAULT 0,
  change_percent numeric NOT NULL DEFAULT 0,
  market text NOT NULL DEFAULT 'SAFEX',
  trend text NOT NULL DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crop_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_crop_prices" ON crop_prices;
CREATE POLICY "select_all_crop_prices" ON crop_prices FOR SELECT
  TO authenticated USING (true);

-- Add index for quick lookups by name
CREATE INDEX IF NOT EXISTS idx_crop_prices_name ON crop_prices(name);
