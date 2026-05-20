/**
 * 错误处理中间件
 * 统一处理所有 API 请求中的错误
 */

/**
 * 自定义 API 错误类
 * 用于创建带有状态码的错误对象
 */
export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // 标记为可预期的操作错误
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 错误处理中间件
 * 当请求的路由不存在时触发
 */
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(`请求的路径不存在: ${req.method} ${req.originalUrl}`, 404);
  next(error);
};

/**
 * 全局错误处理中间件
 * 捕获所有未处理的错误并返回统一格式的错误响应
 */
export const errorHandler = (err, req, res, _next) => {
  // 默认状态码和消息
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';

  // 开发环境下输出详细错误信息
  const isDev = process.env.NODE_ENV === 'development';

  // Mongoose 验证错误处理
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = `数据验证失败: ${messages.join(', ')}`;
  }

  // Mongoose 重复键错误处理
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue).join(', ');
    message = `数据重复: 字段 ${field} 的值已存在`;
  }

  // Mongoose 无效 ObjectId 错误处理
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = `无效的 ID 格式: ${err.value}`;
  }

  // JWT 认证错误处理
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的认证令牌';
  }

  // JWT 过期错误处理
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '认证令牌已过期';
  }

  // 构建错误响应
  const errorResponse = {
    success: false,
    error: {
      message,
      statusCode,
    },
  };

  // 开发环境下添加错误堆栈信息
  if (isDev) {
    errorResponse.error.stack = err.stack;
  }

  // 输出错误日志
  if (statusCode >= 500) {
    console.error(`[ERROR] ${statusCode} ${message}`, isDev ? err.stack : '');
  } else {
    console.warn(`[WARN] ${statusCode} ${message}`);
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
