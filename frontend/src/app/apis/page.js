'use client';

import { Suspense } from 'react';
import ApisContent from './ApisContent';

// 加载状态组件
function LoadingFallback() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">API 市场</h1>
          <p className="text-gray-400">发现最适合你项目的 API</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4" />
              <div className="h-3 bg-gray-700 rounded w-full mb-2" />
              <div className="h-3 bg-gray-700 rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ApisPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ApisContent />
    </Suspense>
  );
}
