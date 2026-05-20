import aiService from '../services/aiService.js';

/**
 * AI控制器 - 处理AI相关请求
 */
class AIController {
  /**
   * 智能API推荐
   * POST /api/ai/recommend
   */
  async recommend(req, res) {
    try {
      const { need, apis } = req.body;
      
      if (!need) {
        return res.status(400).json({ error: '请提供需求描述' });
      }

      const recommendations = await aiService.recommendApis(need, apis || []);
      
      res.json({
        success: true,
        need,
        recommendations,
        count: recommendations.length
      });
    } catch (error) {
      console.error('推荐失败:', error);
      res.status(500).json({ error: '推荐服务暂时不可用' });
    }
  }

  /**
   * 生成API调用代码
   * POST /api/ai/generate-code
   */
  async generateCode(req, res) {
    try {
      const { apiInfo, language } = req.body;
      
      if (!apiInfo) {
        return res.status(400).json({ error: '请提供API信息' });
      }

      const code = await aiService.generateCode(apiInfo, language);
      
      res.json({
        success: true,
        language: language || 'javascript',
        code
      });
    } catch (error) {
      console.error('代码生成失败:', error);
      res.status(500).json({ error: '代码生成服务暂时不可用' });
    }
  }

  /**
   * 错误诊断
   * POST /api/ai/diagnose
   */
  async diagnose(req, res) {
    try {
      const { errorMessage, apiInfo } = req.body;
      
      if (!errorMessage) {
        return res.status(400).json({ error: '请提供错误信息' });
      }

      const diagnosis = await aiService.diagnoseError(errorMessage, apiInfo);
      
      res.json({
        success: true,
        diagnosis
      });
    } catch (error) {
      console.error('诊断失败:', error);
      res.status(500).json({ error: '诊断服务暂时不可用' });
    }
  }
}

export default new AIController();
