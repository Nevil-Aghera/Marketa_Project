import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// @desc   Register new manager
// @route  POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, shopName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 409, 'Email already registered');
    }

    // Check if this is first user (make admin)
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'manager';
    const isApproved = userCount === 0; // first user auto-approved as admin

    const user = await User.create({ name, email, password, shopName, role, isApproved });

    const token = generateToken(user._id);
    successResponse(res, 201, role === 'admin' ? 'Admin registered successfully' : 'Registration successful. Awaiting admin approval.', {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, shopName: user.shopName },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Login
// @route  POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    if (!user.isApproved) {
      return errorResponse(res, 403, 'Your account is pending admin approval');
    }

    const token = generateToken(user._id);
    successResponse(res, 200, 'Login successful', {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, shopName: user.shopName },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get current user
// @route  GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    successResponse(res, 200, 'User fetched successfully', req.user);
  } catch (error) {
    next(error);
  }
};

// @desc   Get all pending managers (admin only)
// @route  GET /api/auth/pending
export const getPendingManagers = async (req, res, next) => {
  try {
    const managers = await User.find({ role: 'manager', isApproved: false }).select('-password');
    successResponse(res, 200, 'Pending managers fetched', managers);
  } catch (error) {
    next(error);
  }
};

// @desc   Approve or reject manager (admin only)
// @route  PATCH /api/auth/approve/:id
export const approveManager = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, 'Manager not found');

    if (action === 'approve') {
      user.isApproved = true;
      await user.save();
      return successResponse(res, 200, 'Manager approved successfully', user);
    } else if (action === 'reject') {
      await User.findByIdAndDelete(req.params.id);
      return successResponse(res, 200, 'Manager rejected and removed');
    } else {
      return errorResponse(res, 400, 'Invalid action. Use "approve" or "reject"');
    }
  } catch (error) {
    next(error);
  }
};
