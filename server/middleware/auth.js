const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
      return next();
    }
    return res.status(401).json({ success: false, message: 'Please log in to access this resource' });
  };
  // Placeholder route
  
  module.exports = {
    isAuthenticated
  };