const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load .env file at the top

exports.identifier = (req, res, next) => {
  let token = req.headers.authorization || req.cookies['Authorization'];

  // Token missing
  if (!token) {
    return res.status(403).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  // Token in 'Bearer <token>' format
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];  // Extract token from 'Bearer <token>'
  } else {
    return res.status(403).json({ success: false, message: 'Unauthorized: Invalid token format' });
  }

  try {
    // Verify the token
    const jwtVerified = jwt.verify(token, process.env.TOKEN_SECRET);

    // Token successfully verified
    if (jwtVerified) {
      console.log(`User authenticated: ${jwtVerified.role} - ID: ${jwtVerified.userId}`);

      // Attach the entire user info if needed
      req.user = jwtVerified;

      // Assign roles and attach IDs directly
      if (jwtVerified.role === 'seeker') {
        req.seekerId = jwtVerified.userId; // Direct assignment
      } else if (jwtVerified.role === 'recruiter') {
        req.recruiterId = jwtVerified.userId;
      } else if (jwtVerified.role === 'admin') {
        req.adminId = jwtVerified.userId;
      } else {
        return res.status(403).json({ success: false, message: 'Unauthorized: Invalid role' });
      }

      next();  // Proceed to the next middleware/controller
    }
  } catch (error) {
    console.log('Token verification error:', error.message);
    return res.status(403).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
};
