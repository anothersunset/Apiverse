/**
 * API 数据抓取脚本
 * 从 GitHub public-apis 仓库获取 API 数据并存入 MongoDB
 * 
 * 使用方法:
 * - npm run fetch-apis
 * - 或直接运行: node src/scripts/fetchApis.js
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../../.env') });

// 导入服务和模型
import { fetchReadmeFromGithub, parseMarkdownTable } from '../services/apiService.js';
import Api from '../models/Api.js';

/**
 * 主函数：执行数据抓取和存储
 */
const main = async () => {
  console.log('🚀 开始抓取 API 数据...\n');

  try {
    // 1. 连接 MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/apiverse';
    console.log(`📡 连接 MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 连接成功\n');

    // 2. 从 GitHub 获取 README 内容
    console.log('📥 正在从 GitHub 获取 README.md...');
    const readmeContent = await fetchReadmeFromGithub();
    console.log(`✅ 获取成功，内容大小: ${(readmeContent.length / 1024).toFixed(2)} KB\n`);

    // 3. 解析 Markdown 表格
    console.log('📝 正在解析 Markdown 表格...');
    const apis = parseMarkdownTable(readmeContent);
    console.log(`✅ 解析完成，共发现 ${apis.length} 个 API\n`);

    if (apis.length === 0) {
      console.log('⚠️ 未解析到任何 API 数据，请检查数据源格式');
      process.exit(0);
    }

    // 4. 统计分类信息
    const categoryCount = {};
    apis.forEach((api) => {
      categoryCount[api.category] = (categoryCount[api.category] || 0) + 1;
    });
    console.log('📊 分类统计:');
    Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`   - ${cat}: ${count} 个 API`);
      });
    console.log('');

    // 5. 清空现有数据
    console.log('🗑️ 正在清空现有 API 数据...');
    const deleteResult = await Api.deleteMany({});
    console.log(`✅ 已删除 ${deleteResult.deletedCount} 条旧数据\n`);

    // 6. 批量插入新数据
    console.log('💾 正在存储新数据到 MongoDB...');
    const BATCH_SIZE = 100;
    let insertedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < apis.length; i += BATCH_SIZE) {
      const batch = apis.slice(i, i + BATCH_SIZE);
      try {
        const result = await Api.insertMany(batch, { ordered: false });
        insertedCount += result.length;
        // 显示进度
        const progress = Math.min(100, Math.round(((i + batch.length) / apis.length) * 100));
        process.stdout.write(`\r   进度: ${progress}% (${insertedCount}/${apis.length})`);
      } catch (error) {
        // 部分插入失败时继续处理
        if (error.insertedDocs) {
          insertedCount += error.insertedDocs.length;
        }
        errorCount++;
      }
    }

    console.log('\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 数据抓取完成统计:');
    console.log('═══════════════════════════════════════');
    console.log(`   总计发现: ${apis.length} 个 API`);
    console.log(`   成功插入: ${insertedCount} 个 API`);
    console.log(`   失败数量: ${apis.length - insertedCount} 个`);
    console.log(`   分类数量: ${Object.keys(categoryCount).length} 个`);
    console.log('═══════════════════════════════════════\n');

    // 7. 创建索引
    console.log('🔍 正在创建搜索索引...');
    await Api.ensureIndexes();
    console.log('✅ 索引创建完成\n');

    console.log('🎉 数据抓取任务全部完成！');
  } catch (error) {
    console.error('\n❌ 数据抓取失败:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    // 关闭 MongoDB 连接
    await mongoose.connection.close();
    console.log('\n🔒 MongoDB 连接已关闭');
  }
};

// 执行主函数
main();
