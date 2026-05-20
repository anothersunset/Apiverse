/**
 * MongoDB 数据库连接配置
 * 使用 Mongoose 连接 MongoDB 数据库
 */

import mongoose from 'mongoose';

/**
 * 连接 MongoDB 数据库
 * @param {string} uri - MongoDB 连接地址，默认使用环境变量或本地地址
 * @returns {Promise<void>}
 */
const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/apiverse';

  try {
    const conn = await mongoose.connect(mongoUri, {
      // Mongoose 7+ 默认使用这些行为，无需显式设置
      // 以下选项保留用于兼容性和文档说明
    });

    console.log(`✅ MongoDB 已连接: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB 连接失败: ${error.message}`);
    // 连接失败时退出进程
    process.exit(1);
  }
};

// 监听 MongoDB 连接事件
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB 连接已断开');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB 错误: ${err.message}`);
});

// 进程退出时关闭 MongoDB 连接
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔒 MongoDB 连接已关闭（应用终止）');
  process.exit(0);
});

export default connectDB;
