const geminiService = require('../services/geminiService');
const geocodingService = require('../services/geocodingService');
const supabase = require('../config/supabase');

class GeocodingController {
  async geocode(req, res, next) {
    try {
      const { description, location_name } = req.body;

      let locationToGeocode = location_name;

      // If no location name, extract from description
      if (!locationToGeocode && description) {
        locationToGeocode = await geminiService.extractLocation(description);
      }

      if (!locationToGeocode) {
        return res.status(400).json({ error: 'No location found in input' });
      }

      const coordinates = await geocodingService.geocode(locationToGeocode);

      // If disaster_id provided, update the disaster location
      if (req.body.disaster_id) {
        const point = `POINT(${coordinates.lng} ${coordinates.lat})`;
        await supabase
          .from('disasters')
          .update({ 
            location: point,
            location_name: coordinates.formatted_address 
          })
          .eq('id', req.body.disaster_id);
      }

      res.json({
        location_name: locationToGeocode,
        coordinates,
        formatted_address: coordinates.formatted_address
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GeocodingController();