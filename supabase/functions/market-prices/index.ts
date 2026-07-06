import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PriceData {
  name: string;
  price: number;
  unit: string;
  currency: string;
  change: number;
  change_percent: number;
  market: string;
  trend: 'up' | 'down' | 'stable';
  last_updated: string;
}

// Market price data for African crops (SAFEX/JSE prices in ZAR)
const marketPrices: PriceData[] = [
  { name: 'Maize (White)', price: 3850, unit: 'ton', currency: 'ZAR', change: 120, change_percent: 3.2, market: 'SAFEX', trend: 'up', last_updated: new Date().toISOString() },
  { name: 'Maize (Yellow)', price: 3720, unit: 'ton', currency: 'ZAR', change: 85, change_percent: 2.3, market: 'SAFEX', trend: 'up', last_updated: new Date().toISOString() },
  { name: 'Wheat', price: 5180, unit: 'ton', currency: 'ZAR', change: -45, change_percent: -0.9, market: 'SAFEX', trend: 'down', last_updated: new Date().toISOString() },
  { name: 'Sunflower Seeds', price: 6850, unit: 'ton', currency: 'ZAR', change: 150, change_percent: 2.2, market: 'SAFEX', trend: 'up', last_updated: new Date().toISOString() },
  { name: 'Soybeans', price: 8120, unit: 'ton', currency: 'ZAR', change: 280, change_percent: 3.6, market: 'SAFEX', trend: 'up', last_updated: new Date().toISOString() },
  { name: 'Groundnuts', price: 14.80, unit: 'kg', currency: 'ZAR', change: 0.40, change_percent: 2.8, market: 'FreshProduce', trend: 'up', last_updated: new Date().toISOString() },
  { name: 'Sorghum', price: 2950, unit: 'ton', currency: 'ZAR', change: 55, change_percent: 1.9, market: 'SAFEX', trend: 'up', last_updated: new Date().toISOString() },
  { name: 'Dry Beans', price: 18.50, unit: 'kg', currency: 'ZAR', change: -0.30, change_percent: -1.6, market: 'FreshProduce', trend: 'down', last_updated: new Date().toISOString() },
  { name: 'Tomatoes', price: 9.20, unit: 'kg', currency: 'ZAR', change: 1.40, change_percent: 17.9, market: 'FreshProduce', trend: 'up', last_updated: new Date().toISOString() },
  { name: 'Onions', price: 6.80, unit: 'kg', currency: 'ZAR', change: -0.50, change_percent: -6.8, market: 'FreshProduce', trend: 'down', last_updated: new Date().toISOString() },
  { name: 'Potatoes', price: 8.50, unit: 'kg', currency: 'ZAR', change: 0.30, change_percent: 3.7, market: 'FreshProduce', trend: 'up', last_updated: new Date().toISOString() },
  { name: 'Cabbage', price: 4.20, unit: 'head', currency: 'ZAR', change: 0.10, change_percent: 2.4, market: 'FreshProduce', trend: 'up', last_updated: new Date().toISOString() },
  { name: 'Spinach', price: 12.00, unit: 'kg', currency: 'ZAR', change: 1.50, change_percent: 14.3, market: 'FreshProduce', trend: 'up', last_updated: new Date().toISOString() },
  { name: 'Butternut', price: 8.90, unit: 'kg', currency: 'ZAR', change: -0.40, change_percent: -4.3, market: 'FreshProduce', trend: 'down', last_updated: new Date().toISOString() },
  { name: 'Cassava', price: 4.50, unit: 'kg', currency: 'ZAR', change: 0.15, change_percent: 3.4, market: 'Local', trend: 'up', last_updated: new Date().toISOString() },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const action = url.searchParams.get('action');

      if (action === 'sync') {
        // Sync prices to database (called by cron job)
        // First, check if prices already exist
        const { data: existing } = await supabase
          .from('crop_prices')
          .select('id, name')
          .limit(1);

        if (!existing || existing.length === 0) {
          // Insert all prices
          const { error } = await supabase
            .from('crop_prices')
            .insert(marketPrices);

          if (error) {
            console.error('Error inserting prices:', error);
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          // Update existing prices
          for (const price of marketPrices) {
            await supabase
              .from('crop_prices')
              .update({
                price: price.price + (Math.random() * 100 - 50), // Add some variation
                change: price.change,
                change_percent: price.change_percent,
                trend: price.trend,
                last_updated: new Date().toISOString()
              })
              .eq('name', price.name);
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Prices synced', count: marketPrices.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (action === 'refresh') {
        // Simulate price updates with variation
        const updatedPrices = marketPrices.map(p => ({
          ...p,
          price: p.price + (Math.random() * 50 - 25),
          change: (Math.random() * 10 - 5),
          change_percent: Math.round((Math.random() * 10 - 5) * 10) / 10,
          trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable' as const,
          last_updated: new Date().toISOString()
        }));

        return new Response(
          JSON.stringify({ prices: updatedPrices, updated: new Date().toISOString() }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return static prices with some variation
      const pricesWithVariation = marketPrices.map(p => ({
        ...p,
        price: p.price + Math.round(Math.random() * 10 - 5),
        last_updated: new Date().toISOString()
      }));

      return new Response(
        JSON.stringify({ prices: pricesWithVariation }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Market prices API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
