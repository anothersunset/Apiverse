// Next.js API Route - AI推荐
import { NextResponse } from 'next/server';

const apis = [
  { id: 1, name: "OpenWeatherMap", description: "天气数据API，提供全球天气预报、历史天气、空气质量等数据", category: "Weather", auth: "apiKey", https: true, url: "https://api.openweathermap.org/data/2.5/" },
  { id: 2, name: "NewsAPI", description: "新闻聚合API，提供全球新闻源、文章搜索和头条新闻", category: "News", auth: "apiKey", https: true, url: "https://newsapi.org/v2/" },
  { id: 3, name: "CoinGecko", description: "加密货币API，提供价格、市值、交易量等数据", category: "Finance", auth: "No", https: true, url: "https://api.coingecko.com/api/v3/" },
  { id: 4, name: "Google Maps", description: "地图服务API，提供地理编码、路线规划、地点搜索等功能", category: "Geocoding", auth: "apiKey", https: true, url: "https://maps.googleapis.com/maps/api/" },
  { id: 5, name: "Spotify", description: "音乐流媒体API，提供歌曲搜索、播放列表、用户数据等功能", category: "Music", auth: "OAuth", https: true, url: "https://api.spotify.com/v1/" },
  { id: 6, name: "OpenAI", description: "AI模型API，提供GPT、DALL-E、Whisper等AI能力", category: "Machine Learning", auth: "apiKey", https: true, url: "https://api.openai.com/v1/" },
  { id: 7, name: "GitHub", description: "代码托管平台API，提供仓库、Issue、PR等管理功能", category: "Development", auth: "OAuth", https: true, url: "https://api.github.com/" },
  { id: 8, name: "Stripe", description: "支付处理API，提供支付、退款、订阅等支付功能", category: "Finance", auth: "apiKey", https: true, url: "https://api.stripe.com/v1/" },
];

export async function POST(request) {
  try {
    const body = await request.json();
    const { need } = body;

    if (!need) {
      return NextResponse.json({ error: '请提供需求描述' }, { status: 400 });
    }

    const keywords = need.toLowerCase().split(/[\s,，.。!！?？、]+/).filter(w => w.length > 1);
    
    const scored = apis.map(api => {
      let score = 0;
      const searchText = `${api.name} ${api.description} ${api.category}`.toLowerCase();
      keywords.forEach(keyword => {
        if (searchText.includes(keyword)) score += 10;
      });
      return { ...api, score };
    });

    const recommendations = scored
      .filter(api => api.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      need,
      recommendations,
      count: recommendations.length
    });
  } catch (error) {
    return NextResponse.json({ error: '请求处理失败' }, { status: 500 });
  }
}
