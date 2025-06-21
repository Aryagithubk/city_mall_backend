const geminiService = require('../services/geminiService');
const supabase = require('../config/supabase');
const logger = require('../utils/logger');

class VerificationController {
  async verifyImage(req, res, next) {
    try {
      const { id } = req.params;
      const { image_url, report_id } = req.body;

      if (!image_url) {
        return res.status(400).json({ error: 'Image URL required' });
      }

      const verificationStatus = await geminiService.verifyImage(image_url);

      // Update report if report_id provided
      if (report_id) {
        await supabase
          .from('reports')
          .update({ verification_status: verificationStatus })
          .eq('id', report_id);
      }

      logger.info(`Image verified: ${verificationStatus} for disaster ${id}`);
      res.json({ 
        disaster_id: id,
        image_url,
        verification_status: verificationStatus 
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VerificationController();