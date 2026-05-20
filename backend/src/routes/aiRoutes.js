import { Router } from 'express';
import aiController from '../controllers/aiController.js';

const router = Router();

// AI推荐
router.post('/recommend', aiController.recommend);

// 代码生成
router.post('/generate-code', aiController.generateCode);

// 错误诊断
router.post('/diagnose', aiController.diagnose);

export default router;
