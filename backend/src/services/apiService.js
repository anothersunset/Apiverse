/**
 * API 数据服务
 * 提供 API 数据的查询、搜索、筛选功能
 */

import axios from 'axios';
import Api from '../models/Api.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * 从 GitHub 获取 public-apis 的 README 内容
 * @returns {Promise<string>} README 的 markdown 内容
 */
export const fetchReadmeFromGithub = async () => {
  try {
    const response = await axios.get(
      'https://api.github.com/repos/public-apis/public-apis/contents/README.md',
      {
        headers: {
          Accept: 'application/vnd.github.v3.raw',
          'User-Agent': 'APIVerse-App',
        },
        timeout: 30000,
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ 获取 GitHub README 失败:', error.message);
    throw new Error('无法获取 API 数据源');
  }
};

/**
 * 解析 Markdown 表格中的 API 数据
 * @param {string} markdown - Markdown 文本内容
 * @returns {Array<Object>} 解析后的 API 数据数组
 */
export const parseMarkdownTable = (markdown) => {
  const apis = [];
  let currentCategory = '';

  // 按行分割 markdown 内容
  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 检测分类标题（## 开头的行）
    if (line.startsWith('## ')) {
      currentCategory = line.replace('## ', '').trim();
      // 去除可能的锚点链接格式 [Category](#category)
      const categoryMatch = currentCategory.match(/\[([^\]]+)\]/);
      if (categoryMatch) {
        currentCategory = categoryMatch[1];
      }
      continue;
    }

    // 解析表格行（以 | 开头且不是分隔符行）
    if (line.startsWith('|') && !line.match(/^\|[\s-:]+\|/) && currentCategory) {
      // 跳过表头行
      if (line.toLowerCase().includes('| name ') || line.toLowerCase().includes('| api ')) {
        continue;
      }

      // 分割表格列
      const columns = line
        .split('|')
        .map((col) => col.trim())
        .filter((col) => col.length > 0);

      // 标准表格格式: | API名称 | 描述 | 认证方式 | HTTPS支持 | CORS支持 |
      if (columns.length >= 4) {
        const nameWithLink = columns[0];
        const description = columns[1];
        const auth = columns[2] || 'unknown';
        const https = columns[3] || 'no';
        const cors = columns[4] || 'unknown';

        // 提取 API 名称和链接
        let name = nameWithLink;
        let url = '';

        // 解析 markdown 链接格式 [Name](url)
        const linkMatch = nameWithLink.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          name = linkMatch[1].trim();
          url = linkMatch[2].trim();
        } else {
          name = nameWithLink.trim();
        }

        // 过滤无效数据
        if (name && name.length > 0 && !name.startsWith('-')) {
          apis.push({
            name,
            description: description.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim(),
            url,
            category: currentCategory,
            auth: normalizeAuth(auth),
            https: https.toLowerCase() === 'yes' || https === '✓',
            cors: normalizeCors(cors),
            health: 'unknown',
          });
        }
      }
    }
  }

  return apis;
};

/**
 * 标准化认证方式字段
 * @param {string} auth - 原始认证方式文本
 * @returns {string} 标准化后的认证方式
 */
const normalizeAuth = (auth) => {
  const authLower = auth.toLowerCase().trim();
  if (authLower === 'no' || authLower === 'none' || authLower === '') return 'none';
  if (authLower.includes('apikey') || authLower.includes('api key') || authLower.includes('x-api-key')) return 'apiKey';
  if (authLower.includes('oauth')) return 'oauth';
  if (authLower.includes('token') || authLower.includes('bearer')) return 'token';
  return 'unknown';
};

/**
 * 标准化 CORS 支持字段
 * @param {string} cors - 原始 CORS 支持文本
 * @returns {string} 标准化后的 CORS 状态
 */
const normalizeCors = (cors) => {
  const corsLower = cors.toLowerCase().trim();
  if (corsLower === 'yes' || corsLower === '✓') return 'yes';
  if (corsLower === 'no' || corsLower === '✗') return 'no';
  return 'unknown';
};

/**
 * 获取 API 列表（支持搜索、筛选、分页）
 * @param {Object} options - 查询选项
 * @param {string} options.search - 搜索关键词
 * @param {string} options.category - 分类筛选
 * @param {string} options.auth - 认证方式筛选
 * @param {boolean} options.https - HTTPS 筛选
 * @param {string} options.cors - CORS 筛选
 * @param {number} options.page - 页码
 * @param {number} options.limit - 每页数量
 * @param {string} options.sort - 排序字段
 * @returns {Promise<Object>} 包含数据和分页信息的结果
 */
export const getApis = async (options = {}) => {
  const {
    search = '',
    category = '',
    auth = '',
    https,
    cors = '',
    page = 1,
    limit = 20,
    sort = '-createdAt',
  } = options;

  // 构建查询条件
  const query = { isActive: true };

  // 文本搜索
  if (search) {
    query.$text = { $search: search };
  }

  // 分类筛选
  if (category) {
    query.category = { $regex: new RegExp(category, 'i') };
  }

  // 认证方式筛选
  if (auth) {
    query.auth = auth;
  }

  // HTTPS 筛选
  if (https !== undefined && https !== '') {
    query.https = https === 'true' || https === true;
  }

  // CORS 筛选
  if (cors) {
    query.cors = cors;
  }

  // 计算分页参数
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  // 并行执行查询和计数
  const [apis, total] = await Promise.all([
    Api.find(query)
      .sort(search ? { score: { $meta: 'textScore' }, ...parseSortParam(sort) } : parseSortParam(sort))
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Api.countDocuments(query),
  ]);

  return {
    data: apis,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
      hasMore: pageNum * limitNum < total,
    },
  };
};

/**
 * 解析排序参数
 * @param {string} sortStr - 排序字符串，如 "-createdAt" 或 "name"
 * @returns {Object} Mongoose 排序对象
 */
const parseSortParam = (sortStr) => {
  const sortObj = {};
  if (!sortStr) return { createdAt: -1 };

  const fields = sortStr.split(',');
  fields.forEach((field) => {
    if (field.startsWith('-')) {
      sortObj[field.substring(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  });

  return sortObj;
};

/**
 * 根据 ID 获取单个 API 详情
 * @param {string} id - API 的 MongoDB ObjectId
 * @returns {Promise<Object>} API 数据对象
 */
export const getApiById = async (id) => {
  const api = await Api.findById(id).lean();
  if (!api) {
    throw new ApiError('未找到指定的 API', 404);
  }
  return api;
};

/**
 * 获取所有分类及其 API 数量
 * @returns {Promise<Array>} 分类列表
 */
export const getCategories = async () => {
  const categories = await Api.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        name: '$_id',
        count: 1,
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return categories;
};
