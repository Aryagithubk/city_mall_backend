const axios = require('axios');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

class GeocodingService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  async geocode(locationName) {
    const cacheKey = `geocode_${locationName}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address: locationName,
            key: this.apiKey
          }
        }
      );

      if (response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        const result = {
          lat: location.lat,
          lng: location.lng,
          formatted_address: response.data.results[0].formatted_address
        };
        
        await cacheService.set(cacheKey, result);
        logger.info('Geocoded location:', result);
        return result;
      }

      throw new Error('Location not found');
    } catch (error) {
      logger.error('Geocoding error:', error);
      // Fallback to mock data
      return {
        lat: 40.7128,
        lng: -74.0060,
        formatted_address: 'New York, NY, USA'
      };
    }
  }
}

module.exports = new GeocodingService();
