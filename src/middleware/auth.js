// Mock authentication middleware
const mockUsers = {
  'netrunnerX': { id: 'netrunnerX', role: 'admin' },
  'reliefAdmin': { id: 'reliefAdmin', role: 'admin' },
  'citizen1': { id: 'citizen1', role: 'contributor' },
  'citizen2': { id: 'citizen2', role: 'contributor' }
};

const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'] || 'netrunnerX';
  const user = mockUsers[userId];
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.user = user;
  next();
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };