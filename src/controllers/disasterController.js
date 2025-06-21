const supabase = require('../config/supabase');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

class DisasterController {
  async create(req, res, next) {
    try {
      const { title, location_name, description, tags } = req.body;
      const userId = req.user.id;

      const auditEntry = {
        action: 'create',
        user_id: userId,
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('disasters')
        .insert({
          title,
          location_name,
          description,
          tags,
          owner_id: userId,
          audit_trail: [auditEntry]
        })
        .select()
        .single();

      if (error) throw error;

      // Emit WebSocket event
      getIO().emit('disaster_updated', { action: 'create', data });
      
      logger.info(`Disaster created: ${title}`, { id: data.id });
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { tag } = req.query;
      let query = supabase.from('disasters').select('*');

      if (tag) {
        query = query.contains('tags', [tag]);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('disasters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Disaster not found' });

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user.id;

      // Get current disaster
      const { data: current } = await supabase
        .from('disasters')
        .select('audit_trail')
        .eq('id', id)
        .single();

      const auditEntry = {
        action: 'update',
        user_id: userId,
        timestamp: new Date().toISOString(),
        changes: updates
      };

      const audit_trail = [...(current?.audit_trail || []), auditEntry];

      const { data, error } = await supabase
        .from('disasters')
        .update({ ...updates, audit_trail })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      getIO().emit('disaster_updated', { action: 'update', data });
      logger.info(`Disaster updated: ${id}`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('disasters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      getIO().emit('disaster_updated', { action: 'delete', id });
      logger.info(`Disaster deleted: ${id}`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DisasterController();