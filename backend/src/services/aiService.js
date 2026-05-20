import axios from 'axios';

// AI服务配置
const AI_CONFIG = {
  // 使用免费的OpenAI兼容API或本地模型
  provider: process.env.AI_PROVIDER || 'local',
  apiKey: process.env.OPENAI_API_KEY || '',
  baseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
};

/**
 * AI服务类 - 提供智能推荐、代码生成、错误诊断功能
 */
class AIService {
  constructor() {
    this.conversationHistory = [];
  }

  /**
   * 智能API推荐
   * @param {string} userNeed - 用户需求描述
   * @param {Array} availableApis - 可用API列表
   * @returns {Array} 推荐的API列表
   */
  async recommendApis(userNeed, availableApis) {
    try {
      // 基于关键词匹配的简单推荐
      const keywords = this.extractKeywords(userNeed);
      const scored = availableApis.map(api => {
        let score = 0;
        const searchText = `${api.name} ${api.description} ${api.category}`.toLowerCase();
        
        keywords.forEach(keyword => {
          if (searchText.includes(keyword.toLowerCase())) {
            score += 10;
          }
        });
        
        // 分类匹配加分
        if (this.matchCategory(userNeed, api.category)) {
          score += 5;
        }
        
        return { ...api, score };
      });

      return scored
        .filter(api => api.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      console.error('AI推荐失败:', error);
      return availableApis.slice(0, 5);
    }
  }

  /**
   * 生成API调用代码
   * @param {Object} apiInfo - API信息
   * @param {string} language - 目标语言 (javascript/python/curl)
   * @returns {string} 生成的代码
   */
  async generateCode(apiInfo, language = 'javascript') {
    const templates = {
      javascript: this.generateJavaScript(apiInfo),
      python: this.generatePython(apiInfo),
      curl: this.generateCurl(apiInfo),
    };

    return templates[language] || templates.javascript;
  }

  /**
   * 错误诊断
   * @param {string} errorMessage - 错误信息
   * @param {Object} apiInfo - API信息
   * @returns {Object} 诊断结果
   */
  async diagnoseError(errorMessage, apiInfo) {
    const commonErrors = {
      '401': {
        problem: '认证失败',
        solution: '请检查API Key是否正确，是否已过期',
        docs: '查看API文档了解认证方式'
      },
      '403': {
        problem: '权限不足',
        solution: '检查API Key权限范围，或联系API提供商',
        docs: '查看API文档了解权限要求'
      },
      '404': {
        problem: '资源不存在',
        solution: '检查API端点URL是否正确',
        docs: '查看API文档确认正确的端点'
      },
      '429': {
        problem: '请求过于频繁',
        solution: '降低请求频率，或申请更高的配额',
        docs: '查看API文档了解速率限制'
      },
      '500': {
        problem: '服务器内部错误',
        solution: '稍后重试，或联系API提供商',
        docs: '查看API状态页面'
      }
    };

    const statusCode = errorMessage.match(/(\d{3})/)?.[1];
    const diagnosis = commonErrors[statusCode] || {
      problem: '未知错误',
      solution: '请检查网络连接和API配置',
      docs: '查看API文档获取帮助'
    };

    return {
      api: apiInfo?.name || 'Unknown API',
      error: errorMessage,
      ...diagnosis,
      timestamp: new Date().toISOString()
    };
  }

  // 辅助方法
  extractKeywords(text) {
    const commonWords = ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
    return text
      .split(/[\s,，.。!！?？、]+/)
      .filter(word => word.length > 1 && !commonWords.includes(word));
  }

  matchCategory(need, category) {
    const categoryMap = {
      '天气': ['weather', 'environment'],
      '音乐': ['music', 'audio'],
      '新闻': ['news', 'media'],
      '金融': ['finance', 'cryptocurrency'],
      '翻译': ['translation', 'language'],
      '图片': ['photo', 'image'],
      '视频': ['video', 'animation'],
      '地图': ['geocoding', 'mapping'],
    };

    const needLower = need.toLowerCase();
    for (const [key, values] of Object.entries(categoryMap)) {
      if (needLower.includes(key) && values.some(v => category.toLowerCase().includes(v))) {
        return true;
      }
    }
    return false;
  }

  generateJavaScript(apiInfo) {
    const hasAuth = apiInfo.auth && apiInfo.auth !== 'No';
    const method = apiInfo.https ? 'https' : 'http';
    
    return `// ${apiInfo.name} - JavaScript调用示例
// ${apiInfo.description}

${hasAuth ? `// 1. 设置API密钥
const API_KEY = 'YOUR_API_KEY';

` : ''}// 2. 发送请求
const response = await fetch('${apiInfo.url || `https://api.example.com/v1`}', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    ${hasAuth ? `'Authorization': \`Bearer \${API_KEY}\`,` : ''}
  },
});

// 3. 处理响应
const data = await response.json();
console.log(data);`;
  }

  generatePython(apiInfo) {
    const hasAuth = apiInfo.auth && apiInfo.auth !== 'No';
    
    return `# ${apiInfo.name} - Python调用示例
# ${apiInfo.description}

import requests

${hasAuth ? `# 1. 设置API密钥
API_KEY = "YOUR_API_KEY"

` : ''}# 2. 发送请求
response = requests.get(
    "${apiInfo.url || 'https://api.example.com/v1'}",
    headers={
        "Content-Type": "application/json",
        ${hasAuth ? `"Authorization": f"Bearer {API_KEY}",` : ''}
    }
)

# 3. 处理响应
data = response.json()
print(data)`;
  }

  generateCurl(apiInfo) {
    const hasAuth = apiInfo.auth && apiInfo.auth !== 'No';
    
    return `# ${apiInfo.name} - cURL调用示例
# ${apiInfo.description}

curl -X GET "${apiInfo.url || 'https://api.example.com/v1'}" \
  -H "Content-Type: application/json" \
  ${hasAuth ? `-H "Authorization: Bearer YOUR_API_KEY" \` : ''}
  | jq`;
  }
}

export default new AIService();
