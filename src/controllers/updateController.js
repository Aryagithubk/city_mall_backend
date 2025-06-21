const scrapingService = require('../services/scrapingService');

class UpdateController {
  async getOfficialUpdates(req, res, next) {
    try {
      const { source = 'fema' } = req.query;
      
      const updates = await scrapingService.fetchOfficialUpdates(source);
      
      res.json(updates);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UpdateController();