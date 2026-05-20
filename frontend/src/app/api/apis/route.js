// Next.js API Route - API列表
import { NextResponse } from 'next/server';

// 内存数据
const apis = [
  { id: 1, name: "OpenWeatherMap", description: "天气数据API，提供全球天气预报、历史天气、空气质量等数据", category: "Weather", auth: "apiKey", https: true, cors: "yes", url: "https://api.openweathermap.org/data/2.5/" },
  { id: 2, name: "NewsAPI", description: "新闻聚合API，提供全球新闻源、文章搜索和头条新闻", category: "News", auth: "apiKey", https: true, cors: "unknown", url: "https://newsapi.org/v2/" },
  { id: 3, name: "CoinGecko", description: "加密货币API，提供价格、市值、交易量等数据", category: "Finance", auth: "No", https: true, cors: "yes", url: "https://api.coingecko.com/api/v3/" },
  { id: 4, name: "Google Maps", description: "地图服务API，提供地理编码、路线规划、地点搜索等功能", category: "Geocoding", auth: "apiKey", https: true, cors: "unknown", url: "https://maps.googleapis.com/maps/api/" },
  { id: 5, name: "Spotify", description: "音乐流媒体API，提供歌曲搜索、播放列表、用户数据等功能", category: "Music", auth: "OAuth", https: true, cors: "unknown", url: "https://api.spotify.com/v1/" },
  { id: 6, name: "OpenAI", description: "AI模型API，提供GPT、DALL-E、Whisper等AI能力", category: "Machine Learning", auth: "apiKey", https: true, cors: "yes", url: "https://api.openai.com/v1/" },
  { id: 7, name: "GitHub", description: "代码托管平台API，提供仓库、Issue、PR等管理功能", category: "Development", auth: "OAuth", https: true, cors: "yes", url: "https://api.github.com/" },
  { id: 8, name: "Stripe", description: "支付处理API，提供支付、退款、订阅等支付功能", category: "Finance", auth: "apiKey", https: true, cors: "no", url: "https://api.stripe.com/v1/" },
  { id: 9, name: "Twilio", description: "通信API，提供短信、语音、视频通话等功能", category: "Communication", auth: "apiKey", https: true, cors: "unknown", url: "https://api.twilio.com/2010-04-01/" },
  { id: 10, name: "Unsplash", description: "图片API，提供高质量免费图片搜索和下载", category: "Photography", auth: "OAuth", https: true, cors: "yes", url: "https://api.unsplash.com/" },
  { id: 11, name: "Translate", description: "翻译API，支持100+语言的文本翻译", category: "Translation", auth: "apiKey", https: true, cors: "unknown", url: "https://translation.googleapis.com/language/translate/v2/" },
  { id: 12, name: "JokeAPI", description: "笑话API，提供各种类型的笑话和段子", category: "Entertainment", auth: "No", https: true, cors: "yes", url: "https://v2.jokeapi.dev/" },
  { id: 13, name: "Cat Facts", description: "猫咪事实API，随机提供有趣的猫咪知识", category: "Animals", auth: "No", https: true, cors: "unknown", url: "https://catfact.ninja/" },
  { id: 14, name: "JSONPlaceholder", description: "虚拟REST API，用于测试和原型开发", category: "Development", auth: "No", https: true, cors: "unknown", url: "https://jsonplaceholder.typicode.com/" },
  { id: 15, name: "IP Geolocation", description: "IP定位API，根据IP地址获取地理位置信息", category: "Geocoding", auth: "apiKey", https: true, cors: "yes", url: "https://ipapi.co/" },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  let filtered = [...apis];

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(api =>
      api.name.toLowerCase().includes(searchLower) ||
      api.description.toLowerCase().includes(searchLower) ||
      api.category.toLowerCase().includes(searchLower)
    );
  }

  if (category) {
    filtered = filtered.filter(api => api.category.toLowerCase() === category.toLowerCase());
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paginated,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
}
