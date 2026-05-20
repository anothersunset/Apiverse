'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import ApiCard from '@/components/ApiCard';
import { getApis, getCategories, searchApis } from '@/services/api';

export default function ApisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [apis, setApis] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // 从 URL 获取筛选参数
  const category = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  // 加载分类
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('加载分类失败:', error);
      }
    };
    loadCategories();
  }, []);

  // 加载 API 列表
  const loadApis = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      if (searchQuery) {
        result = await searchApis(searchQuery, {
          category,
          page: currentPage,
          limit: 12,
        });
      } else {
        result = await getApis({
          category,
          page: currentPage,
          limit: 12,
        });
      }
      setApis(result.data || result);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('加载 API 列表失败:', error);
      // 使用模拟数据
      setApis(getMockApis());
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, currentPage]);

  useEffect(() => {
    loadApis();
  }, [loadApis]);

  // 处理分类点击
  const handleCategoryClick = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === category) {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    params.delete('page');
    router.push(`/apis?${params.toString()}`);
  };

  // 处理搜索
  const handleSearch = (query) => {
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`/apis?${params.toString()}`);
  };

  // 处理分页
  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/apis?${params.toString()}`);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 模拟数据
  const getMockApis = () => [
    { id: 1, name: 'OpenAI API', description: '强大的人工智能 API，支持文本生成、图像生成、代码生成等多种功能', category: 'AI', auth: 'apiKey', https: true },
    { id: 2, name: 'OpenWeatherMap', description: '全球天气数据 API，提供实时天气、预报、历史数据等', category: '天气', auth: 'apiKey', https: true },
    { id: 3, name: 'Google Maps API', description: '地图服务 API，支持地理编码、路径规划、街景等功能', category: '地图', auth: 'apiKey', https: true },
    { id: 4, name: 'Stripe API', description: '支付处理 API，支持在线支付、订阅管理、发票生成等', category: '支付', auth: 'bearer', https: true },
    { id: 5, name: 'Twitter API', description: '社交媒体 API，支持推文发布、用户信息、趋势分析等', category: '社交', auth: 'oauth', https: true },
    { id: 6, name: 'CoinGecko API', description: '加密货币数据 API，提供价格、市值、交易量等实时数据', category: '金融', auth: null, https: true },
    { id: 7, name: 'DeepL API', description: '高质量翻译 API，支持 26 种语言互译', category: '翻译', auth: 'apiKey', https: true },
    { id: 8, name: 'NewsAPI', description: '新闻数据 API，聚合全球新闻源，支持关键词搜索', category: '数据', auth: 'apiKey', https: true },
    { id: 9, name: 'GitHub API', description: '代码托管平台 API，支持仓库管理、Issue 追踪、Pull Request 等', category: '开发', auth: 'bearer', https: true },
  ];

  // 默认分类
  const defaultCategories = [
    { name: 'AI', icon: '🤖' },
    { name: '数据', icon: '📊' },
    { name: '金融', icon: '💰' },
    { name: '天气', icon: '🌤️' },
    { name: '地图', icon: '🗺️' },
    { name: '社交', icon: '💬' },
    { name: '支付', icon: '💳' },
    { name: '翻译', icon: '🌐' },
    { name: '开发', icon: '⚙️' },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">API 市场</h1>
          <p className="text-gray-400">发现最适合你项目的 API</p>
        </div>

        {/* 搜索栏 */}
        <div className="mb-8 max-w-2xl">
          <SearchBar onSearch={handleSearch} placeholder="搜索 API 名称、描述、分类..." />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧分类筛选 */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-gray-800 rounded-xl p-4 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">分类筛选</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryClick('')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !category
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  全部分类
                </button>
                {displayCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      category === cat.name
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 右侧 API 列表 */}
          <main className="flex-1">
            {/* 结果统计 */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-400">
                {searchQuery && (
                  <span>搜索 &ldquo;<span className="text-white">{searchQuery}</span>&rdquo; 的结果</span>
                )}
                {category && (
                  <span>分类: <span className="text-primary-400">{category}</span></span>
                )}
              </p>
              <p className="text-gray-400 text-sm">
                共 {apis.length} 个 API
              </p>
            </div>

            {/* API 卡片网格 */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-4" />
                    <div className="h-3 bg-gray-700 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-700 rounded w-5/6" />
                  </div>
                ))}
              </div>
            ) : apis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {apis.map((api, index) => (
                  <div
                    key={api.id || index}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ApiCard api={api} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">未找到匹配的 API</h3>
                <p className="text-gray-400">尝试调整搜索条件或浏览其他分类</p>
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  上一页
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === i + 1
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  下一页
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
