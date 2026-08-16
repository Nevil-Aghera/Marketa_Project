import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('stock');
  const [adjustModal, setAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjForm, setAdjForm] = useState({ type: 'out', quantity: 1, reason: 'damaged', notes: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const [pRes, hRes] = await Promise.all([
        API.get(`/inventory?${params}`),
        API.get('/inventory/history?limit=100'),
      ]);
      setProducts(pRes.data.data);
      setHistory(hRes.data.data);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, status]);

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return toast.error('Select a product');
    setSaving(true);
    try {
      await API.post('/inventory/adjust', { productId: selectedProduct, ...adjForm, quantity: Number(adjForm.quantity) });
      toast.success('Stock adjusted!');
      setAdjustModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const reasonColors = { purchase: 'badge-success', sale: 'badge-info', damaged: 'badge-danger', expired: 'badge-warning', lost: 'badge-danger', manual_correction: 'badge-purple' };

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>Inventory</h1><p>Monitor and manage stock levels</p></div>
        <button className="btn btn-primary" onClick={() => setAdjustModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Stock Adjustment
        </button>
      </div>

      <div className="tabs" style={{ maxWidth: 320, marginBottom: 20 }}>
        <button className={`tab-btn ${tab === 'stock' ? 'active' : ''}`} onClick={() => setTab('stock')}>Current Stock</button>
        <button className={`tab-btn ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>Stock History</button>
      </div>

      {tab === 'stock' ? (
        <div className="card">
          <div className="toolbar">
            <div className="toolbar-left">
              <div className="search-input-wrapper" style={{ width: 260 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select style={{ width: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
          </div>
          {loading ? <LoadingSpinner /> : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Unit</th><th>Min Level</th><th>Status</th><th>Value</th></tr></thead>
                <tbody>
                  {products.length === 0 ? <tr><td colSpan="7"><div className="empty-state"><h3>No products found</h3></div></td></tr>
                    : products.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td><span className="badge badge-purple">{p.category?.name || '—'}</span></td>
                      <td style={{ fontWeight: 700, fontSize: 16, color: p.isOutOfStock ? 'var(--danger)' : p.isLowStock ? 'var(--warning)' : 'var(--success)' }}>{p.stock}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.unit}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.minStock}</td>
                      <td>
                        {p.isOutOfStock ? <span className="badge badge-danger">Out of Stock</span>
                          : p.isLowStock ? <span className="badge badge-warning">Low Stock</span>
                          : <span className="badge badge-success">In Stock</span>}
                      </td>
                      <td>₹{(p.stock * p.sellingPrice).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Product</th><th>Type</th><th>Quantity</th><th>Prev Stock</th><th>New Stock</th><th>Reason</th><th>Reference</th><th>Date</th></tr></thead>
              <tbody>
                {history.length === 0 ? <tr><td colSpan="8"><div className="empty-state"><h3>No stock history yet</h3></div></td></tr>
                  : history.map(h => (
                  <tr key={h._id}>
                    <td style={{ fontWeight: 500 }}>{h.productName}</td>
                    <td><span className={`badge ${h.type === 'in' ? 'badge-success' : h.type === 'out' ? 'badge-danger' : 'badge-warning'}`}>{h.type === 'in' ? '↑ IN' : h.type === 'out' ? '↓ OUT' : '⚙ ADJ'}</span></td>
                    <td style={{ fontWeight: 700 }}>{h.type === 'out' ? '-' : '+'}{h.quantity}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{h.previousStock}</td>
                    <td style={{ fontWeight: 600 }}>{h.newStock}</td>
                    <td><span className={`badge ${reasonColors[h.reason] || 'badge-purple'}`}>{h.reason?.replace('_', ' ')}</span></td>
                    <td style={{ color: 'var(--accent)', fontSize: 12 }}>{h.reference || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(h.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={adjustModal} onClose={() => setAdjustModal(false)} title="Manual Stock Adjustment"
        footer={<><button className="btn btn-ghost" onClick={() => setAdjustModal(false)}>Cancel</button><button className="btn btn-primary" form="adj-form" type="submit" disabled={saving}>{saving ? 'Adjusting...' : 'Adjust Stock'}</button></>}>
        <form id="adj-form" onSubmit={handleAdjust}>
          <div className="form-group">
            <label>Product *</label>
            <select required value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
              <option value="">Select product</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name} (Current: {p.stock})</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Adjustment Type</label>
              <select value={adjForm.type} onChange={e => setAdjForm({ ...adjForm, type: e.target.value })}>
                <option value="in">Add Stock (In)</option>
                <option value="out">Remove Stock (Out)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="1" required value={adjForm.quantity} onChange={e => setAdjForm({ ...adjForm, quantity: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Reason</label>
            <select value={adjForm.reason} onChange={e => setAdjForm({ ...adjForm, reason: e.target.value })}>
              <option value="damaged">Damaged Products</option>
              <option value="expired">Expired Products</option>
              <option value="lost">Lost Products</option>
              <option value="manual_correction">Manual Correction</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea placeholder="Reason for adjustment..." value={adjForm.notes} onChange={e => setAdjForm({ ...adjForm, notes: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
