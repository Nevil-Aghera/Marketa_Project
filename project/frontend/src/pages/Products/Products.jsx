import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [form, setForm] = useState({
    name: '', category: '', brand: '', barcode: '', purchasePrice: '', sellingPrice: '',
    stock: '', unit: 'piece', minStock: '5', expiryDate: '', description: ''
  });
  const [imgFile, setImgFile] = useState(null);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (catFilter) params.set('category', catFilter);
      if (stockFilter === 'low') params.set('lowStock', 'true');
      if (stockFilter === 'out') params.set('outOfStock', 'true');
      const [pRes, cRes] = await Promise.all([
        API.get(`/products?${params}`),
        API.get('/categories'),
      ]);
      setProducts(pRes.data.data);
      setCategories(cRes.data.data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, catFilter, stockFilter]);

  const openCreate = () => {
    setEditData(null);
    setForm({ name: '', category: '', brand: '', barcode: '', purchasePrice: '', sellingPrice: '', stock: '', unit: 'piece', minStock: '5', expiryDate: '', description: '' });
    setImgFile(null);
    setModal(true);
  };

  const openEdit = (p) => {
    setEditData(p);
    setForm({
      name: p.name, category: p.category?._id || '', brand: p.brand || '', barcode: p.barcode || '',
      purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice, stock: p.stock,
      unit: p.unit, minStock: p.minStock, expiryDate: p.expiryDate ? p.expiryDate.split('T')[0] : '', description: p.description || ''
    });
    setImgFile(null);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (imgFile) fd.append('image', imgFile);
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editData) { await API.put(`/products/${editData._id}`, fd, config); toast.success('Product updated!'); }
      else { await API.post('/products', fd, config); toast.success('Product created!'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving product'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await API.delete(`/products/${id}`); toast.success('Deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const ch = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>Products</h1><p>Manage your product catalog</p></div>
        <button className="btn btn-primary" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-input-wrapper" style={{ width: 260 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select style={{ width: 160 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select style={{ width: 140 }} value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
              <option value="">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{products.length} products</span>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Image</th><th>Product</th><th>Category</th><th>Purchase Price</th><th>Selling Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="8"><div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                    <h3>No products found</h3><p>Add your first product to get started</p>
                  </div></td></tr>
                ) : products.map(p => (
                  <tr key={p._id}>
                    <td>
                      {p.image ? <img src={`https://marketa-mu-project.onrender.com${p.image}`} alt={p.name} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                        : <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 18 }}>📦</div>}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      {p.brand && <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.brand}</div>}
                    </td>
                    <td><span className="badge badge-purple">{p.category?.name || '—'}</span></td>
                    <td>₹{p.purchasePrice.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600 }}>₹{p.sellingPrice.toLocaleString('en-IN')}</td>
                    <td>{p.stock} {p.unit}(s)</td>
                    <td>
                      {p.isOutOfStock ? <span className="badge badge-danger">Out of Stock</span>
                        : p.isLowStock ? <span className="badge badge-warning">Low Stock</span>
                        : <span className="badge badge-success">In Stock</span>}
                    </td>
                    <td>
                      <div className="td-actions">
                        {/* <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(p)} title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button> */}
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(p._id)} title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editData ? 'Edit Product' : 'Add Product'} size="lg"
        footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" form="prod-form" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Product'}</button></>}>
        <form id="prod-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>Product Name *</label><input required placeholder="e.g. Santoor Soap" value={form.name} onChange={ch('name')} /></div>
            <div className="form-group">
              <label>Category *</label>
              <select required value={form.category} onChange={ch('category')}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Brand</label><input placeholder="e.g. Wipro" value={form.brand} onChange={ch('brand')} /></div>
            <div className="form-group"><label>Barcode</label><input placeholder="Optional" value={form.barcode} onChange={ch('barcode')} /></div>
            <div className="form-group"><label>Purchase Price (₹) *</label><input required type="number" min="0" step="0.01" placeholder="0.00" value={form.purchasePrice} onChange={ch('purchasePrice')} /></div>
            <div className="form-group"><label>Selling Price (₹) *</label><input required type="number" min="0" step="0.01" placeholder="0.00" value={form.sellingPrice} onChange={ch('sellingPrice')} /></div>
            <div className="form-group"><label>Stock Quantity *</label><input required type="number" min="0" placeholder="0" value={form.stock} onChange={ch('stock')} /></div>
            <div className="form-group">
              <label>Unit *</label>
              <select value={form.unit} onChange={ch('unit')}>
                <option value="piece">Piece</option><option value="kg">Kg</option><option value="gram">Gram</option>
                <option value="litre">Litre</option><option value="ml">ml</option><option value="box">Box</option>
                <option value="packet">Packet</option><option value="dozen">Dozen</option>
              </select>
            </div>
            <div className="form-group"><label>Min Stock Level</label><input type="number" min="0" placeholder="5" value={form.minStock} onChange={ch('minStock')} /></div>
            <div className="form-group"><label>Expiry Date</label><input type="date" value={form.expiryDate} onChange={ch('expiryDate')} /></div>
          </div>
          <div className="form-group"><label>Product Image</label><input type="file" accept="image/*" onChange={e => setImgFile(e.target.files[0])} style={{ padding: '8px' }} /></div>
          <div className="form-group"><label>Description</label><textarea placeholder="Optional description..." value={form.description} onChange={ch('description')} /></div>
        </form>
      </Modal>
    </div>
  );
}
