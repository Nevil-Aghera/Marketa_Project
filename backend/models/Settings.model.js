import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  shopName: { type: String, default: 'MARKETA Supermarket', trim: true },
  logo: { type: String },
  gstNumber: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  currency: { type: String, default: '₹' },
  invoiceFooter: { type: String, default: 'Thank you for shopping with us!', trim: true },
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
