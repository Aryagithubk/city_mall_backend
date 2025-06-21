const socialMediaService = require('../services/socialMediaService');
const { getIO } = require('../config/socket');

class SocialMediaController {
  async getSocialMediaReports(req, res, next) {
    try {
      const { id } = req.params;
      
      // Get disaster details to extract keywords
      const keywords = ['flood', 'help', 'urgent', 'relief'];
      
      const reports = await socialMediaService.fetchDisasterReports(id, keywords);
      
      // Emit updates via WebSocket
      getIO().emit('social_media_updated', { disaster_id: id, reports });
      
      res.json(reports);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SocialMediaController();