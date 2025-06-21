const supabase = require('../config/supabase');
const logger = require('../utils/logger');

class CacheService {
  async get(key) {
    try {
      const { data, error } = await supabase
        .from('cache')
        .select('value, expires_at')
        .eq('key', key)
        .single();

      if (error || !data) return null;

      if (new Date(data.expires_at) < new Date()) {
        await this.delete(key);
        return null;
      }

      return data.value;
    } catch (err) {
      logger.error('Cache get error:', err);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 3600) {
    try {
      const expires_at = new Date(Date.now() + ttlSeconds * 1000);
      
      const { error } = await supabase
        .from('cache')
        .upsert({
          key,
          value,
          expires_at
        });

      if (error) throw error;
      logger.info(`Cache set: ${key}`);
    } catch (err) {
      logger.error('Cache set error:', err);
    }
  }

  async delete(key) {
    try {
      await supabase
        .from('cache')
        .delete()
        .eq('key', key);
    } catch (err) {
      logger.error('Cache delete error:', err);
    }
  }
}

module.exports = new CacheService();