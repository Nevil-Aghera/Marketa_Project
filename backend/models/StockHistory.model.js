import mongoose from 'mongoose';

const stockHistorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  type: { type: String, enum: ['in', 'out', 'adjustment'], required: true },
  quantity: { type: Number, required: true },
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  reason: {
    type: String,
    enum: ['purchase', 'sale', 'damaged', 'expired', 'lost', 'manual_correction'],
    required: true,
  },
  reference: { type: String }, // invoice number
  notes: { type: String, trim: true },
}, { timestamps: true });

const StockHistory = mongoose.model('StockHistory', stockHistorySchema);
export default StockHistory;
