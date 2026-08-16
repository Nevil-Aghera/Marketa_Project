import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function CreatePurchase() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([{ product: '', productName: '', quantity: 1, purchasePrice: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [sRes, pRes] = await Promise.all([API.get('/suppliers'), API.get('/products')]);
      setSuppliers(sRes.data.data);
      setProducts(pRes.data.data);
    };
    load();
  }, []);

  const addItem = () => setItems([...items, { product: '', productName: '', quantity: 1, purchasePrice: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    if (field === 'product') {
      const prod = products.find(p => p._id === value);
      if (prod) { updated[i].productName = prod.name; updated[i].purchasePrice = prod.purchasePrice; }
    }
    setItems(updated);
  };

  const total = items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplier) return toast.error('Please select a supplier');
    if (items.some(it => !it.product)) return toast.error('Please select all products');
    setSaving(true);
    try {
      await API.post('/purchases', { supplier, items, notes, purchaseDate });
      toast.success('Purchase invoice created! Stock updated.');
      navigate('/purchases');
    } catch (err) { toast.error(err.response?.data?.message || 'Error creating purchase'); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-slide" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <div><h1>New Purchase</h1><p>Record a new stock purchase</p></div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>Purchase Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Supplier *</label>
              <select required value={supplier} onChange={e => setSupplier(e.target.value)}>
                <option value="">Select supplier</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name} — {s.company || s.phone}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea placeholder="Any notes about this purchase..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Purchase Items</h3>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Item
            </button>
          </div>

          {items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px auto', gap: 12, marginBottom: 12, alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                {i === 0 && <label>Product</label>}
                <select value={item.product} onChange={e => updateItem(i, 'product', e.target.value)} required>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                {i === 0 && <label>Qty</label>}
                <input type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                {i === 0 && <label>Purchase Price (₹)</label>}
                <input type="number" min="0" step="0.01" value={item.purchasePrice} onChange={e => updateItem(i, 'purchasePrice', Number(e.target.value))} required />
              </div>
              <button type="button" className="btn btn-danger btn-icon" onClick={() => removeItem(i)} disabled={items.length === 1} style={{ marginBottom: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}

          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning)' }}>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/purchases')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating...' : '✅ Create Purchase'}
          </button>
        </div>
      </form>
    </div>
  );
}
