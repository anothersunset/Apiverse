/**
 * API 控制器
 * 处理 API 相关的 HTTP 请求
 */

import * as apiService from '../services/apiService.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * 获取 API 列表
 * GET /api/apis
 * 
 * 查询参数:
 * - search: 搜索关键词
 * - category: 分类筛选
 * - auth: 认证方式筛选
 * - https: HTTPS 筛选 (true/false)
 * - cors: CORS 筛选 (yes/no/unknown)
 * - page: 页码 (默认 1)
 * - limit: 每页数量 (默认 20)
 * - sort: 排序字段 (默认 -createdAt)
 */
export const getApis = async (req, res, next) => {
  try {
    const result = await apiService.getApis({
      search: req.query.search,
      category: req.query.category,
      auth: req.query.auth,
      https: req.query.https,
      cors: req.query.cors,
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个 API 详情
 * GET /api/apis/:id
 */
export const getApiById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 验证 ObjectId 格式
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ApiError('无效的 API ID 格式', 400);
    }

    const api = await apiService.getApiById(id);

    res.json({
      success: true,
      data: api,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取所有分类
 * GET /api/categories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await apiService.getCategories();

    res.json({
      success: true,
      data: categories,
      total: categories.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取 API 统计信息
 * GET /api/stats
 */
export const getStats = async (req, res, next) => {
  try {
    const { default: Api } = await import('../models/Api.js');

    // 并行执行多个统计查询
    const [totalApis, categories, authStats, httpsStats] = await Promise.all([
      Api.countDocuments({ isActive: true }),
      Api.distinct('category', { isActive: true }),
      Api.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$auth', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Api.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$https', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalApis,
        totalCategories: categories.length,
        categories,
        authDistribution: authStats,
        httpsSupport: {
          supported: httpsStats.find((s) => s._id === true)?.count || 0,
          unsupported: httpsStats.find((s) => s._id === false)?.count || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getApis,
  getApiById,
  getCategories,
  getStats,
};
