import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { errorResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 401, 'Please log in to access this resource');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return errorResponse(res, 401, 'User not found');
    }
    
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired token');
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return errorResponse(res, 403, 'Access denied. Admin only.');
  }
};

export const isApproved = (req, res, next) => {
  if (req.user && req.user.isApproved) {
    next();
  } else {
    return errorResponse(res, 403, 'Your account is pending approval. Please contact admin.');
  }
};
