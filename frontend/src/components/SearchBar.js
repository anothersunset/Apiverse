'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ onSearch, placeholder = '搜索 API...' }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/apis?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div
        className={`relative flex items-center transition-all duration-300 ${
          isFocused ? 'ring-2 ring-primary-500' : ''
        }`}
      >
        {/* 搜索图标 */}
        <svg
          className="absolute left-4 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* 输入框 */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 transition-colors"
        />

        {/* 搜索按钮 */}
        <button
          type="submit"
          className="absolute right-2 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          搜索
        </button>
      </div>

      {/* 快捷提示 */}
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
        <span>热门：</span>
        {['天气API', 'AI翻译', '区块链', '地图服务'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setQuery(tag);
              if (onSearch) {
                onSearch(tag);
              } else {
                router.push(`/apis?search=${encodeURIComponent(tag)}`);
              }
            }}
            className="hover:text-primary-400 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
}