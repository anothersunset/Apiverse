/**
 * API 路由配置
 * 定义 API 相关的 HTTP 路由
 */

import { Router } from 'express';
import * as apiController from '../controllers/apiController.js';

const router = Router();

/**
 * @route   GET /api/apis
 * @desc    获取 API 列表（支持搜索、筛选、分页）
 * @access  Public
 * @query   {string} search - 搜索关键词
 * @query   {string} category - 分类筛选
 * @query   {string} auth - 认证方式筛选
 * @query   {boolean} https - HTTPS 筛选
 * @query   {string} cors - CORS 筛选
 * @query   {number} page - 页码
 * @query   {number} limit - 每页数量
 * @query   {string} sort - 排序字段
 */
router.get('/apis', apiController.getApis);

/**
 * @route   GET /api/apis/:id
 * @desc    获取单个 API 详情
 * @access  Public
 * @param   {string} id - API 的 MongoDB ObjectId
 */
router.get('/apis/:id', apiController.getApiById);

/**
 * @route   GET /api/categories
 * @desc    获取所有 API 分类及其数量
 * @access  Public
 */
router.get('/categories', apiController.getCategories);

/**
 * @route   GET /api/stats
 * @desc    获取 API 统计信息
 * @access  Public
 */
router.get('/stats', apiController.getStats);

export default router;
