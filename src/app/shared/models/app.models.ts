export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'farmer' | 'admin' | 'expert';
  country: string;
  province: string;
  language: string;
  onboardingComplete: boolean;
}

export interface Farm {
  id: string;
  name: string;
  size: number;
  sizeUnit: 'ha' | 'acres';
  province: string;
  country: string;
  crops: CropRecord[];
  livestock: LivestockRecord[];
  soilType: string;
  waterSource: string;
  image?: string;
}

export interface CropRecord {
  id: string;
  name: string;
  variety?: string;
  plantedDate: string;
  expectedHarvestDate: string;
  area: number;
  areaUnit: 'ha' | 'acres';
  status: 'planted' | 'growing' | 'ready' | 'harvested';
  healthScore: number;
  icon: string;
}

export interface LivestockRecord {
  id: string;
  type: string;
  breed?: string;
  count: number;
  healthStatus: 'good' | 'fair' | 'poor';
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  location: string;
  forecast: WeatherForecast[];
  uvIndex: number;
  rainfall: number;
}

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  rain: number;
}

export interface CropPrice {
  id: string;
  name: string;
  price: number;
  unit: string;
  currency: string;
  change: number;
  changePercent: number;
  market: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thinking?: boolean;
  attachments?: string[];
}

export interface DiseaseDetection {
  id: string;
  imageUrl: string;
  cropType: string;
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  treatment: string[];
  recommendations: string[];
  detectedAt: Date;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  category: 'produce' | 'inputs' | 'equipment' | 'services';
  seller: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  verified: boolean;
}

export interface Notification {
  id: string;
  type: 'weather' | 'disease' | 'market' | 'planner' | 'ai' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  icon: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  category: 'planting' | 'irrigation' | 'harvesting' | 'spraying' | 'fertilizing' | 'other';
  status: 'pending' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  farmId?: string;
}

export interface YieldForecast {
  cropName: string;
  predictedYield: number;
  historicalYield: number;
  unit: string;
  confidence: number;
  factors: YieldFactor[];
  monthlyData: { month: string; predicted: number; historical: number; }[];
}

export interface YieldFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  score: number;
  description: string;
}

export interface CommunityPost {
  id: string;
  author: { name: string; avatar?: string; role: string; location: string; };
  title: string;
  content: string;
  category: 'question' | 'success' | 'tip' | 'discussion';
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  createdAt: Date;
  image?: string;
}
