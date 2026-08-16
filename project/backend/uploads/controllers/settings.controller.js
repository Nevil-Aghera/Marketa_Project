import Settings from '../models/Settings.model.js';
import { successResponse } from '../utils/apiResponse.js';
import fs from 'fs';
import path from 'path';

export const getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    successResponse(res, 200, 'Settings fetched', settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      const currentSettings = await Settings.findOne();
      if (currentSettings?.logo) {
        const oldPath = path.join(process.cwd(), currentSettings.logo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.logo = `/uploads/${req.file.filename}`;
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(updateData);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, updateData, { new: true, runValidators: true });
    }

    successResponse(res, 200, 'Settings updated successfully', settings);
  } catch (error) {
    next(error);
  }
};
