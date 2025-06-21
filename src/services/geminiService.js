const axios = require('axios');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async extractLocation(description) {
    const cacheKey = `gemini_location_${description.substring(0, 50)}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: `Extract location names from this disaster description. Return only the location name(s), nothing else: "${description}"`
            }]
          }]
        }
      );

      const location = response.data.candidates[0].content.parts[0].text.trim();
      await cacheService.set(cacheKey, location);
      logger.info('Location extracted:', location);
      return location;
    } catch (error) {
      logger.error('Gemini location extraction error:', error);
      throw error;
    }
  }

  async verifyImage(imageUrl) {
    const cacheKey = `gemini_verify_${imageUrl}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/gemini-pro-vision:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [
              { text: "Analyze this image for signs of manipulation or verify if it shows a genuine disaster context. Respond with 'verified', 'suspicious', or 'manipulated'." },
              { 
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageUrl // In real implementation, convert URL to base64
                }
              }
            ]
          }]
        }
      );

      const result = response.data.candidates[0].content.parts[0].text.trim();
      await cacheService.set(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('Gemini image verification error:', error);
      return 'verification_failed';
    }
  }
}

module.exports = new GeminiService();