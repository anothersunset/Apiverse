'use client';

import Link from 'next/link';

export default function ApiCard({ api }) {
  const {
    id,
    name,
    description,
    category,
    auth,
    https,
    cors,
    url,
  } = api;

  const getAuthBadge = (auth) => {
    const badges = {
      apiKey: { label: 'API Key', color: 'bg-blue-500/20 text-blue-400' },
      oauth: { label: 'OAuth', color: 'bg-purple-500/20 text-purple-400' },
      bearer: { label: 'Bearer', color: 'bg-green-500/20 text-green-400' },
      null: { label: '无需认证', color: 'bg-gray-500/20 text-gray-400' },
    };
    return badges[auth] || badges.null;
  };

  const authBadge = getAuthBadge(auth);

  return (
    <Link href={`/apis/${id || name?.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="gradient-border group cursor-pointer h-full">
        <div className="bg-gray-800 rounded-xl p-6 h-full transition-all duration-300 group-hover:bg-gray-750 group-hover:-translate-y-1">
          {/* 头部：名称和分类 */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
              {name}
            </h3>
            {category && (
              <span className="px-2 py-1 text-xs font-medium bg-primary-500/20 text-primary-400 rounded-full whitespace-nowrap">
                {category}
              </span>
            )}
          </div>

          {/* 描述 */}
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
            {description || '暂无描述'}
          </p>

          {/* 底部标签 */}
          <div className="flex flex-wrap gap-2">
            {/* 认证方式 */}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${authBadge.color}`}>
              {authBadge.label}
            </span>

            {/* HTTPS 支持 */}
            {https && (
              <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                HTTPS
              </span>
            )}

            {/* CORS 支持 */}
            {cors && cors !== 'no' && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded-full">
                CORS ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}