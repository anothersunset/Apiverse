'use client';

import { useRouter } from 'next/navigation';

export default function CategoryTags({ categories = [] }) {
  const router = useRouter();

  // 默认分类，如果没有传入分类数据
  const defaultCategories = [
    { name: 'AI', icon: '🤖', count: 156 },
    { name: '数据', icon: '📊', count: 234 },
    { name: '金融', icon: '💰', count: 89 },
    { name: '天气', icon: '🌤️', count: 45 },
    { name: '地图', icon: '🗺️', count: 67 },
    { name: '社交', icon: '💬', count: 123 },
    { name: '支付', icon: '💳', count: 78 },
    { name: '翻译', icon: '🌐', count: 34 },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  const handleCategoryClick = (categoryName) => {
    router.push(`/apis?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {displayCategories.map((category, index) => (
        <button
          key={category.name || index}
          onClick={() => handleCategoryClick(category.name)}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/80 border border-gray-700 hover:border-primary-500 hover:bg-primary-500/10 transition-all duration-300"
        >
          <span className="text-lg">{category.icon}</span>
          <span className="text-gray-300 group-hover:text-primary-400 transition-colors">
            {category.name}
          </span>
          {category.count && (
            <span className="text-xs text-gray-500 group-hover:text-gray-400">
              {category.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}