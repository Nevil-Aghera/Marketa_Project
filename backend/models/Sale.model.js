import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  sellingPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, default: 'Walk-in Customer' },
  items: [saleItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'upi', 'card'], default: 'cash' },
  saleDate: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
}, { timestamps: true });

const Sale = mongoose.model('Sale', saleSchema);
export default Sale;
