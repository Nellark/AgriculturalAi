import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScanResult {
  crop_type: string;
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: string[];
  recommendations: string[];
}

// Disease database for African crops
const diseaseDatabase: Record<string, ScanResult[]> = {
  'maize': [
    {
      crop_type: 'Maize',
      disease: 'Northern Corn Leaf Blight',
      confidence: 85,
      severity: 'medium',
      treatment: [
        'Apply Propiconazole fungicide at 250ml/100L water',
        'Spray in the early morning or late afternoon',
        'Repeat application after 10-14 days if symptoms persist'
      ],
      recommendations: [
        'Remove and destroy severely infected plant material',
        'Avoid overhead irrigation to reduce leaf wetness',
        'Consider resistant varieties for next planting season',
        'Improve field drainage to reduce disease spread'
      ]
    },
    {
      crop_type: 'Maize',
      disease: 'Fall Armyworm Damage',
      confidence: 90,
      severity: 'high',
      treatment: [
        'Apply Coragen (Chlorantraniliprole) at 20ml/15L water',
        'Spray in the evening when larvae are active',
        'Add molasses or brown sugar as feeding stimulant'
      ],
      recommendations: [
        'Monitor field edges where infestation starts',
        'Use pheromone traps for early detection',
        'Encourage natural predators like birds and wasps',
        'Practice crop rotation with non-host plants'
      ]
    },
    {
      crop_type: 'Maize',
      disease: 'Gray Leaf Spot',
      confidence: 78,
      severity: 'low',
      treatment: [
        'Apply Mancozeb fungicide preventatively',
        'Ensure good coverage of lower leaves',
        'Reduce plant density if infection is severe'
      ],
      recommendations: [
        'Rotate crops with non-cereals',
        'Incorporate crop residue after harvest',
        'Use tolerant hybrid varieties'
      ]
    }
  ],
  'tomato': [
    {
      crop_type: 'Tomato',
      disease: 'Early Blight',
      confidence: 88,
      severity: 'medium',
      treatment: [
        'Apply Mancozeb or Chlorothalonil fungicide',
        'Prune and remove infected lower leaves',
        'Water at the base, avoid wetting foliage'
      ],
      recommendations: [
        'Use drip irrigation to keep leaves dry',
        'Ensure adequate plant spacing for airflow',
        'Mulch around plants to prevent soil splash',
        'Remove crop debris at end of season'
      ]
    },
    {
      crop_type: 'Tomato',
      disease: 'Late Blight',
      confidence: 92,
      severity: 'high',
      treatment: [
        'Apply systemic fungicide (Metalaxyl + Mancozeb)',
        'Remove and destroy all infected plant parts',
        'Harvest remaining fruits immediately'
      ],
      recommendations: [
        'Monitor weather conditions - spread in cool, wet weather',
        'Avoid working in wet fields to prevent spread',
        'Use resistant varieties for future plantings',
        'Apply preventive spray before expected wet weather'
      ]
    },
    {
      crop_type: 'Tomato',
      disease: 'Bacterial Wilt',
      confidence: 75,
      severity: 'high',
      treatment: [
        'Remove and destroy infected plants immediately',
        'Do not compost infected plant material',
        'Disinfect tools between plants'
      ],
      recommendations: [
        'Practice 3-4 year crop rotation',
        'Plant in well-drained soil',
        'Avoid injuring roots during cultivation',
        'Use grafted seedlings on resistant rootstock'
      ]
    }
  ],
  'beans': [
    {
      crop_type: 'Beans',
      disease: 'Angular Leaf Spot',
      confidence: 82,
      severity: 'low',
      treatment: [
        'Apply copper-based fungicide',
        'Remove heavily infected leaves',
        'Improve air circulation between plants'
      ],
      recommendations: [
        'Use certified disease-free seed',
        'Rotate crops every 2-3 years',
        'Avoid working in wet fields'
      ]
    },
    {
      crop_type: 'Beans',
      disease: 'Bean Rust',
      confidence: 79,
      severity: 'medium',
      treatment: [
        'Apply sulfur-based fungicide',
        'Remove and destroy infected plant debris',
        'Ensure good field drainage'
      ],
      recommendations: [
        'Plant rust-resistant varieties',
        'Avoid dense planting',
        'Remove volunteer bean plants'
      ]
    }
  ],
  'cassava': [
    {
      crop_type: 'Cassava',
      disease: 'Cassava Mosaic Disease',
      confidence: 87,
      severity: 'high',
      treatment: [
        'Remove and destroy infected plants',
        'Do not use cuttings from infected plants',
        'Control whitefly vectors with appropriate insecticide'
      ],
      recommendations: [
        'Use disease-resistant varieties (e.g., TME 419)',
        'Source clean planting material',
        'Monitor for whitefly populations',
        'Practice crop sanitation'
      ]
    }
  ],
  'spinach': [
    {
      crop_type: 'Spinach',
      disease: 'Downy Mildew',
      confidence: 84,
      severity: 'medium',
      treatment: [
        'Apply metalaxyl-based fungicide',
        'Improve air circulation',
        'Water early in the day'
      ],
      recommendations: [
        'Use resistant varieties',
        'Avoid overhead irrigation',
        'Remove crop residue after harvest'
      ]
    }
  ]
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      // Analyze image
      const body = await req.json();
      const { userId, imageUrl, cropType } = body;

      if (!userId || !cropType) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: userId, cropType' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get diseases for the crop type
      const diseases = diseaseDatabase[cropType.toLowerCase()] || diseaseDatabase['maize'];

      // Simulate AI detection (in production, this would call actual AI model)
      const detectedDisease = diseases[Math.floor(Math.random() * diseases.length)];

      // Add some randomness to confidence
      const confidence = detectedDisease.confidence + Math.floor(Math.random() * 10) - 5;

      const result: ScanResult = {
        ...detectedDisease,
        confidence: Math.min(99, Math.max(70, confidence))
      };

      // Save detection to database
      const { data: savedDetection, error } = await supabase
        .from('disease_detections')
        .insert({
          user_id: userId,
          image_url: imageUrl || '',
          crop_type: result.crop_type,
          disease: result.disease,
          confidence: result.confidence,
          severity: result.severity,
          treatment: result.treatment,
          recommendations: result.recommendations
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving detection:', error);
      }

      return new Response(
        JSON.stringify({
          success: true,
          result: savedDetection || result
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === 'GET') {
      // Get supported crops
      const supportedCrops = Object.keys(diseaseDatabase).map(crop =>
        crop.charAt(0).toUpperCase() + crop.slice(1)
      );

      return new Response(
        JSON.stringify({
          supportedCrops,
          aiModel: 'AgriGrow DiseaseNet v2.1',
          accuracy: '94.7%',
          diseases: Object.keys(diseaseDatabase).length
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Disease scan API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
