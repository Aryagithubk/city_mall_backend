const supabase = require('../config/supabase');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

class ResourceController {
  async getNearbyResources(req, res, next) {
    try {
      const { id } = req.params;
      const { lat, lon, radius = 10000 } = req.query; // radius in meters

      if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude required' });
      }

      // Raw SQL query for geospatial search
      const { data, error } = await supabase.rpc('get_nearby_resources', {
        disaster_id: id,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        radius_meters: parseInt(radius)
      });

      if (error) {
        // Fallback to regular query if function doesn't exist
        const { data: resources, error: queryError } = await supabase
          .from('resources')
          .select('*')
          .eq('disaster_id', id);

        if (queryError) throw queryError;

        logger.info(`Resources found: ${resources.length} for disaster ${id}`);
        return res.json(resources);
      }

      getIO().emit('resources_updated', { disaster_id: id, resources: data });
      logger.info(`Resource mapped: ${data.length} resources within ${radius}m`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async createResource(req, res, next) {
    try {
      const { disaster_id, name, location_name, type } = req.body;

      const { data, error } = await supabase
        .from('resources')
        .insert({
          disaster_id,
          name,
          location_name,
          type
        })
        .select()
        .single();

      if (error) throw error;

      getIO().emit('resources_updated', { action: 'create', data });
      logger.info(`Resource created: ${name} at ${location_name}`);
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResourceController();