import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '' };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.data);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditData(null); setForm(emptyForm); setModal(true); };
  const openEdit = (cat) => { setEditData(cat); setForm({ name: cat.name, description: cat.description || '' }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editData) {
        await API.put(`/categories/${editData._id}`, form);
        toast.success('Category updated!');
      } else {
        await API.post('/categories', form);
        toast.success('Category created!');
      }
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving category'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success('Category deleted');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>Categories</h1><p>Organize your products into categories</p></div>
        <button className="btn btn-primary" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Category
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-input-wrapper" style={{ width: 280 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{filtered.length} categories</span>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Category Name</th><th>Description</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="5">
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                      <h3>No categories found</h3>
                      <p>Add your first category to get started</p>
                    </div>
                  </td></tr>
                ) : filtered.map((cat, i) => (
                  <tr key={cat._id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td><span className="badge badge-purple">{cat.name}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{cat.description || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(cat.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(cat)} title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(cat._id)} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editData ? 'Edit Category' : 'Add Category'}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" form="cat-form" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Category'}</button>
        </>}>
        <form id="cat-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category Name *</label>
            <input required placeholder="e.g. Dairy" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea placeholder="Optional description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
