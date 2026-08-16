import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, trim: true },
  barcode: { type: String, trim: true },
  image: { type: String },
  purchasePrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  unit: { type: String, required: true, default: 'piece' },
  minStock: { type: Number, default: 5, min: 0 },
  expiryDate: { type: Date },
  description: { type: String, trim: true },
  isLowStock: { type: Boolean, default: false },
  isOutOfStock: { type: Boolean, default: false },
}, { timestamps: true });

// Auto-calculate stock status
productSchema.pre('save', function (next) {
  this.isOutOfStock = this.stock === 0;
  this.isLowStock = this.stock > 0 && this.stock <= this.minStock;
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
