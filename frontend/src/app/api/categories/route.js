// Next.js API Route - 分类列表
import { NextResponse } from 'next/server';

const apis = [
  { id: 1, name: "OpenWeatherMap", category: "Weather" },
  { id: 2, name: "NewsAPI", category: "News" },
  { id: 3, name: "CoinGecko", category: "Finance" },
  { id: 4, name: "Google Maps", category: "Geocoding" },
  { id: 5, name: "Spotify", category: "Music" },
  { id: 6, name: "OpenAI", category: "Machine Learning" },
  { id: 7, name: "GitHub", category: "Development" },
  { id: 8, name: "Stripe", category: "Finance" },
  { id: 9, name: "Twilio", category: "Communication" },
  { id: 10, name: "Unsplash", category: "Photography" },
  { id: 11, name: "Translate", category: "Translation" },
  { id: 12, name: "JokeAPI", category: "Entertainment" },
  { id: 13, name: "Cat Facts", category: "Animals" },
  { id: 14, name: "JSONPlaceholder", category: "Development" },
  { id: 15, name: "IP Geolocation", category: "Geocoding" },
];

export async function GET() {
  const categories = [...new Set(apis.map(api => api.category))];
  const categoryCounts = categories.map(cat => ({
    name: cat,
    count: apis.filter(api => api.category === cat).length
  }));

  return NextResponse.json({
    success: true,
    data: categoryCounts
  });
}
