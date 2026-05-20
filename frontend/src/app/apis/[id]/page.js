'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getApiById, callApi, generateCode } from '@/services/api';

export default function ApiDetailPage() {
  const params = useParams();
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // 调试工作台状态
  const [method, setMethod] = useState('GET');
  const [requestUrl, setRequestUrl] = useState('');
  const [requestHeaders, setRequestHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState(null);
  const [calling, setCalling] = useState(false);

  // AI 代码生成状态
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadApi = async () => {
      try {
        const data = await getApiById(params.id);
        setApi(data);
        setRequestUrl(data.url || '');
      } catch (error) {
        console.error('加载 API 详情失败:', error);
        // 使用模拟数据
        setApi(getMockApi());
      } finally {
        setLoading(false);
      }
    };
    loadApi();
  }, [params.id]);

  // 模拟数据
  const getMockApi = () => ({
    id: params.id,
    name: 'OpenAI API',
    description: 'OpenAI API 提供强大的人工智能能力，包括文本生成、图像生成、代码生成、语音识别等多种功能。支持 GPT-4、DALL-E、Whisper 等最新模型。',
    category: 'AI',
    auth: 'apiKey',
    https: true,
    cors: 'yes',
    url: 'https://api.openai.com/v1/chat/completions',
    documentation: 'https://platform.openai.com/docs',
    endpoints: [
      { method: 'POST', path: '/v1/chat/completions', description: '文本生成' },
      { method: 'POST', path: '/v1/images/generations', description: '图像生成' },
      { method: 'POST', path: '/v1/audio/transcriptions', description: '语音转文字' },
    ],
    examples: {
      request: 'curl -X POST https://api.openai.com/v1/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d \'{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello!"}]}\'',
      response: '{\n  "id": "chatcmpl-123",\n  "object": "chat.completion",\n  "model": "gpt-4",\n  "choices": [{\n    "message": {\n      "role": "assistant",\n      "content": "Hello! How can I help you today?"\n    }\n  }]\n}',
    },
  });

  // 调用 API
  const handleCallApi = async () => {
    setCalling(true);
    try {
      let headers = {};
      try {
        headers = JSON.parse(requestHeaders);
      } catch (e) {
        console.error('Headers JSON 解析错误');
      }

      const result = await callApi(
        requestUrl,
        method,
        headers,
        method !== 'GET' ? requestBody : null
      );
      setResponse(result);
    } catch (error) {
      setResponse({
        status: 500,
        data: { error: error.message },
        error: true,
      });
    } finally {
      setCalling(false);
    }
  };

  // 生成代码
  const handleGenerateCode = async () => {
    setGenerating(true);
    try {
      const result = await generateCode(params.id, selectedLanguage);
      setGeneratedCode(result.code || getDefaultCode());
    } catch (error) {
      console.error('生成代码失败:', error);
      setGeneratedCode(getDefaultCode());
    } finally {
      setGenerating(false);
    }
  };

  // 默认代码示例
  const getDefaultCode = () => {
    const codes = {
      javascript: `// JavaScript (Fetch API)
const response = await fetch('${requestUrl}', {
  method: '${method}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  }${method !== 'GET' ? `,\n  body: JSON.stringify(${requestBody || '{}'})` : ''}
});

const data = await response.json();
console.log(data);`,
      python: `# Python (Requests)
import requests

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
}

${method !== 'GET' ? `payload = ${requestBody || '{}'}

response = requests.${method.toLowerCase()}('${requestUrl}', json=payload, headers=headers)` : `response = requests.${method.toLowerCase()}('${requestUrl}', headers=headers)`}

print(response.json())`,
      curl: `curl -X ${method} '${requestUrl}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer YOUR_API_KEY'${method !== 'GET' ? ` \\
  -d '${requestBody || '{}'}'` : ''}`,
    };
    return codes[selectedLanguage] || codes.javascript;
  };

  // 获取方法颜色
  const getMethodColor = (m) => {
    const colors = {
      GET: 'bg-green-500/20 text-green-400',
      POST: 'bg-blue-500/20 text-blue-400',
      PUT: 'bg-yellow-500/20 text-yellow-400',
      DELETE: 'bg-red-500/20 text-red-400',
      PATCH: 'bg-purple-500/20 text-purple-400',
    };
    return colors[m] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!api) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-white mb-2">API 未找到</h2>
        <p className="text-gray-400 mb-4">请检查 API ID 是否正确</p>
        <Link href="/apis" className="text-primary-400 hover:text-primary-300">
          ← 返回 API 市场
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 返回链接 */}
        <Link
          href="/apis"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回 API 市场
        </Link>

        {/* API 基本信息 */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{api.name}</h1>
              <p className="text-gray-400 mb-4">{api.description}</p>
              <div className="flex flex-wrap gap-2">
                {api.category && (
                  <span className="px-3 py-1 text-sm bg-primary-500/20 text-primary-400 rounded-full">
                    {api.category}
                  </span>
                )}
                {api.auth && (
                  <span className="px-3 py-1 text-sm bg-purple-500/20 text-purple-400 rounded-full">
                    {api.auth}
                  </span>
                )}
                {api.https && (
                  <span className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded-full">
                    HTTPS
                  </span>
                )}
              </div>
            </div>
            {api.documentation && (
              <a
                href={api.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                查看文档
              </a>
            )}
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {['info', 'playground', 'codegen'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'info' && '📋 基本信息'}
              {tab === 'playground' && '🧪 调试工作台'}
              {tab === 'codegen' && '🤖 代码生成'}
            </button>
          ))}
        </div>

        {/* 标签页内容 */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 端点列表 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">API 端点</h3>
              <div className="space-y-3">
                {api.endpoints?.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg"
                  >
                    <span className={`px-2 py-1 text-xs font-bold rounded ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm text-gray-300 flex-1">{endpoint.path}</code>
                    <span className="text-sm text-gray-400">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 请求示例 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">请求示例</h3>
              <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
                <code>{api.examples?.request}</code>
              </pre>
            </div>

            {/* 响应示例 */}
            <div className="bg-gray-800 rounded-xl p-6 lg:col-span-2">
              <h3 className="text-xl font-semibold text-white mb-4">响应示例</h3>
              <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-300">
                <code>{api.examples?.response}</code>
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'playground' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 请求配置 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">请求配置</h3>
              
              {/* URL 和方法 */}
              <div className="flex gap-2 mb-4">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={requestUrl}
                  onChange={(e) => setRequestUrl(e.target.value)}
                  placeholder="输入请求 URL"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Headers */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">请求头 (JSON)</label>
                <textarea
                  value={requestHeaders}
                  onChange={(e) => setRequestHeaders(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Body */}
              {method !== 'GET' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">请求体 (JSON)</label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={6}
                    placeholder='{"key": "value"}'
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              )}

              {/* 发送按钮 */}
              <button
                onClick={handleCallApi}
                disabled={calling || !requestUrl}
                className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {calling ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                    发送中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    发送请求
                  </>
                )}
              </button>
            </div>

            {/* 响应结果 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">响应结果</h3>
              {response ? (
                <div>
                  {/* 状态码 */}
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm text-gray-400">状态码:</span>
                    <span
                      className={`px-2 py-1 text-sm font-medium rounded ${
                        response.status >= 200 && response.status < 300
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {response.status}
                    </span>
                  </div>

                  {/* 响应体 */}
                  <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 max-h-96 overflow-y-auto">
                    <code>{JSON.stringify(response.data, null, 2)}</code>
                  </pre>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>点击 &ldquo;发送请求&rdquo; 查看响应结果</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'codegen' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 语言选择 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">选择语言</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['javascript', 'python', 'curl'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedLanguage === lang
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {lang === 'javascript' && 'JavaScript'}
                    {lang === 'python' && 'Python'}
                    {lang === 'curl' && 'cURL'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateCode}
                disabled={generating}
                className="w-full px-4 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                    生成中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    生成代码
                  </>
                )}
              </button>
            </div>

            {/* 代码展示 */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">生成的代码</h3>
                {generatedCode && (
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedCode)}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    复制
                  </button>
                )}
              </div>
              {generatedCode ? (
                <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 max-h-96">
                  <code>{generatedCode}</code>
                </pre>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <p>选择语言并点击 &ldquo;生成代码&rdquo;</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}