const axios = require('axios');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

class SocialMediaService {
  async fetchDisasterReports(disasterId, keywords = []) {
    const cacheKey = `social_media_${disasterId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    try {
      // Mock implementation - replace with real Twitter/Bluesky API
      const response = await axios.get('http://localhost:8000/api/mock-social-media');
      
      const filteredPosts = response.data.filter(post => 
        keywords.some(keyword => post.post.toLowerCase().includes(keyword.toLowerCase()))
      );

      await cacheService.set(cacheKey, filteredPosts, 300); // 5 minutes cache
      logger.info(`Social media reports fetched for disaster: ${disasterId}`);
      return filteredPosts;
    } catch (error) {
      logger.error('Social media fetch error:', error);
      return [];
    }
  }
}

module.exports = new SocialMediaService();