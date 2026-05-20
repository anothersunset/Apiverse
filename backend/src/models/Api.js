/**
 * API 数据模型
 * 定义 API 的数据结构，用于存储和检索 API 信息
 */

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * API Schema 定义
 * 包含 API 的所有属性字段
 */
const apiSchema = new Schema(
  {
    // API 名称（必填）
    name: {
      type: String,
      required: [true, 'API 名称不能为空'],
      trim: true,
      index: true,
    },

    // API 描述
    description: {
      type: String,
      trim: true,
      default: '',
    },

    // API 访问地址（必填）
    url: {
      type: String,
      required: [true, 'API URL 不能为空'],
      trim: true,
    },

    // API 分类（必填）
    category: {
      type: String,
      required: [true, 'API 分类不能为空'],
      trim: true,
      index: true,
    },

    // 认证方式: none, apiKey, oauth, token 等
    auth: {
      type: String,
      enum: ['none', 'apiKey', 'oauth', 'token', 'unknown'],
      default: 'unknown',
    },

    // 是否支持 HTTPS
    https: {
      type: Boolean,
      default: false,
    },

    // CORS 支持状态: yes, no, unknown
    cors: {
      type: String,
      enum: ['yes', 'no', 'unknown'],
      default: 'unknown',
    },

    // API 健康状态
    health: {
      type: String,
      enum: ['healthy', 'unhealthy', 'unknown'],
      default: 'unknown',
    },

    // API 来源链接
    source: {
      type: String,
      trim: true,
      default: '',
    },

    // 标签列表（用于搜索优化）
    tags: [{
      type: String,
      trim: true,
    }],

    // 是否可见（软删除标记）
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // 自动添加 createdAt 和 updatedAt 时间戳
    timestamps: true,

    // JSON 序列化配置
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * 全文搜索索引
 * 支持对 name、description、category 字段的文本搜索
 */
apiSchema.index(
  { name: 'text', description: 'text', category: 'text', tags: 'text' },
  {
    weights: {
      name: 10,        // 名称权重最高
      category: 5,     // 分类次之
      tags: 3,         // 标签
      description: 1,  // 描述权重最低
    },
    name: 'api_text_index',
  }
);

/**
 * 复合索引：分类 + 名称
 */
apiSchema.index({ category: 1, name: 1 });

/**
 * 虚拟字段：获取 API 的显示状态
 */
apiSchema.virtual('statusDisplay').get(function () {
  const statusMap = {
    healthy: '✅ 正常',
    unhealthy: '❌ 异常',
    unknown: '❓ 未知',
  };
  return statusMap[this.health] || '❓ 未知';
});

/**
 * 静态方法：获取所有分类列表
 */
apiSchema.statics.getCategories = function () {
  return this.distinct('category', { isActive: true });
};

/**
 * 静态方法：按分类统计数量
 */
apiSchema.statics.getCategoryCounts = function () {
  return this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
};

const Api = model('Api', apiSchema);

export default Api;
