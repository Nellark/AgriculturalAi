import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WeatherResponse {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  location: string;
  uvIndex: number;
  rainfall: number;
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    rain: number;
  }>;
}

// Weather condition mapping to Material icons
const weatherIcons: Record<string, string> = {
  'Clear': 'sunny',
  'Sunny': 'sunny',
  'Partly cloudy': 'partly_cloudy_day',
  'Cloudy': 'cloud',
  'Overcast': 'cloud',
  'Mist': 'foggy',
  'Fog': 'foggy',
  'Rain': 'rainy',
  'Light rain': 'rainy',
  'Heavy rain': 'thunderstorm',
  'Thunderstorm': 'thunderstorm',
  'Drizzle': 'grain',
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat') || '-23.9'; // Default: Polokwane
    const lon = url.searchParams.get('lon') || '29.45';
    const location = url.searchParams.get('location') || 'Polokwane, Limpopo';

    // Check for OpenWeatherMap API key
    const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');

    let weatherData: WeatherResponse;

    if (apiKey) {
      // Use real OpenWeatherMap API
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      const [weatherRes, forecastRes] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl)
      ]);

      const weather = await weatherRes.json();
      const forecast = await forecastRes.json();

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyForecast: WeatherResponse['forecast'] = [];

      // Process 5-day forecast
      const processedDays = new Set<string>();
      for (const item of forecast.list || []) {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();
        if (!processedDays.has(dayKey) && processedDays.size < 5) {
          processedDays.add(dayKey);
          dailyForecast.push({
            day: days[date.getDay()],
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            condition: item.weather[0]?.main || 'Partly cloudy',
            icon: weatherIcons[item.weather[0]?.main] || 'partly_cloudy_day',
            rain: item.pop ? Math.round(item.pop * 100) : 0
          });
        }
      }

      weatherData = {
        temperature: Math.round(weather.main?.temp || 25),
        feelsLike: Math.round(weather.main?.feels_like || 27),
        humidity: weather.main?.humidity || 60,
        windSpeed: Math.round((weather.wind?.speed || 10) * 3.6), // m/s to km/h
        condition: weather.weather[0]?.description || 'Partly Cloudy',
        icon: weatherIcons[weather.weather[0]?.main] || 'partly_cloudy_day',
        location: location,
        uvIndex: 6, // Would need separate API call
        rainfall: weather.rain?.['1h'] || 0,
        forecast: dailyForecast
      };
    } else {
      // Generate realistic demo weather for African agriculture context
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();

      // Seasonal temperature variation (Southern Hemisphere)
      // June-August (winter): cooler, December-February (summer): hotter
      const seasonalTemp = month >= 5 && month <= 7 ? 18 : month >= 11 || month <= 1 ? 30 : 25;
      const temp = seasonalTemp + Math.sin(day * 0.5) * 5;

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const conditions = ['Sunny', 'Partly cloudy', 'Partly cloudy', 'Cloudy', 'Rainy', 'Sunny'];

      const dailyForecast: WeatherResponse['forecast'] = [];
      for (let i = 0; i < 5; i++) {
        const forecastDay = new Date(now);
        forecastDay.setDate(day + i);
        const condIdx = (day + i) % conditions.length;
        dailyForecast.push({
          day: days[forecastDay.getDay()],
          high: Math.round(temp + 4),
          low: Math.round(temp - 6),
          condition: conditions[condIdx],
          icon: weatherIcons[conditions[condIdx]] || 'partly_cloudy_day',
          rain: condIdx === 4 ? 60 : 0
        });
      }

      weatherData = {
        temperature: Math.round(temp),
        feelsLike: Math.round(temp + 3),
        humidity: 55 + Math.round(Math.random() * 20),
        windSpeed: 10 + Math.round(Math.random() * 15),
        condition: 'Partly Cloudy',
        icon: 'partly_cloudy_day',
        location: location,
        uvIndex: 6 + Math.round(Math.random() * 3),
        rainfall: 0.5,
        forecast: dailyForecast
      };
    }

    return new Response(
      JSON.stringify(weatherData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Weather API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
