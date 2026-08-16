import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function CreateSale() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customer, setCustomer] = useState('');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ product: '', productName: '', quantity: 1, sellingPrice: 0, stock: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [cRes, pRes] = await Promise.all([API.get('/customers'), API.get('/products')]);
      setCustomers(cRes.data.data);
      setProducts(pRes.data.data);
    };
    load();
  }, []);

  const addItem = () => setItems([...items, { product: '', productName: '', quantity: 1, sellingPrice: 0, stock: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    if (field === 'product') {
      const prod = products.find(p => p._id === value);
      if (prod) { updated[i].productName = prod.name; updated[i].sellingPrice = prod.sellingPrice; updated[i].stock = prod.stock; }
    }
    setItems(updated);
  };

  const subtotal = items.reduce((sum, it) => sum + (it.quantity * it.sellingPrice), 0);
  const total = subtotal - Number(discount);

  const handleCustomerChange = (e) => {
    const val = e.target.value;
    setCustomer(val);
    if (!val) setCustomerName('Walk-in Customer');
    else {
      const cust = customers.find(c => c._id === val);
      if (cust) setCustomerName(cust.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some(it => !it.product)) return toast.error('Please select all products');
    for (const it of items) {
      if (it.quantity > it.stock) return toast.error(`Insufficient stock for ${it.productName}. Available: ${it.stock}`);
    }
    setSaving(true);
    try {
      await API.post('/sales', { customer: customer || undefined, customerName, items, discount: Number(discount), paymentMethod, notes });
      toast.success('Sale created! Stock updated.');
      navigate('/sales');
    } catch (err) { toast.error(err.response?.data?.message || 'Error creating sale'); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-slide" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <div><h1>New Sale</h1><p>Create a sales invoice</p></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>Sale Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Customer (Optional)</label>
              <select value={customer} onChange={handleCustomerChange}>
                <option value="">Walk-in Customer</option>
                {customers.map(c => <option key={c._id} value={c._id}>{c.name} — {c.mobile}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="cash">💵 Cash</option>
                <option value="upi">📱 UPI</option>
                <option value="card">💳 Card</option>
              </select>
            </div>
            <div className="form-group">
              <label>Discount (₹)</label>
              <input type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea placeholder="Optional notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Sale Items</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Item
            </button>
          </div>

          {items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 140px auto', gap: 12, marginBottom: 12, alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                {i === 0 && <label>Product</label>}
                <select value={item.product} onChange={e => updateItem(i, 'product', e.target.value)} required>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                {i === 0 && <label>Qty</label>}
                <input type="number" min="1" max={item.stock || 9999} value={item.quantity}
                  onChange={e => updateItem(i, 'quantity', Number(e.target.value))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                {i === 0 && <label>Selling Price (₹)</label>}
                <input type="number" min="0" step="0.01" value={item.sellingPrice}
                  onChange={e => updateItem(i, 'sellingPrice', Number(e.target.value))} required />
              </div>
              <button type="button" className="btn btn-danger btn-icon" onClick={() => removeItem(i)} disabled={items.length === 1}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}

          <div className="divider" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ display: 'flex', gap: 40, color: 'var(--text-muted)', fontSize: 14 }}>
              <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', gap: 40, color: 'var(--warning)', fontSize: 14 }}>
                <span>Discount</span><span>— ₹{Number(discount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 40, fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>
              <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/sales')}>Cancel</button>
          <button type="submit" className="btn btn-success" disabled={saving}>
            {saving ? 'Processing...' : '✅ Create Sale Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
