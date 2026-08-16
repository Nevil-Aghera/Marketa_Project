import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ['low_stock', 'out_of_stock', 'info'], default: 'info' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
