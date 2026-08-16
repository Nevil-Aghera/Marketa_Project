import Purchase from '../models/Purchase.model.js';
import Sale from '../models/Sale.model.js';

export const generatePurchaseInvoiceNumber = async () => {
  const count = await Purchase.countDocuments();
  const num = String(count + 1).padStart(6, '0');
  return `PUR-${num}`;
};

export const generateSaleInvoiceNumber = async () => {
  const count = await Sale.countDocuments();
  const num = String(count + 1).padStart(6, '0');
  return `INV-${num}`;
};
