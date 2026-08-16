import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const empty = { name: '', company: '', phone: '', email: '', address: '', gstNumber: '' };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = async (q = '') => {
    try {
      const { data } = await API.get(`/suppliers?search=${q}`);
      setSuppliers(data.data);
    } catch { toast.error('Failed to load suppliers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditData(null); setForm(empty); setModal(true); };
  const openEdit = (s) => { setEditData(s); setForm({ name: s.name, company: s.company || '', phone: s.phone, email: s.email || '', address: s.address || '', gstNumber: s.gstNumber || '' }); setModal(true); };
  const openView = (s) => { setSelected(s); setViewModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editData) { await API.put(`/suppliers/${editData._id}`, form); toast.success('Supplier updated!'); }
      else { await API.post('/suppliers', form); toast.success('Supplier added!'); }
      setModal(false); load(search);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try { await API.delete(`/suppliers/${id}`); toast.success('Deleted'); load(search); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const ch = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>Suppliers</h1><p>Manage your product suppliers</p></div>
        <button className="btn btn-primary" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Supplier
        </button>
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search-input-wrapper" style={{ width: 300 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search by name or company..." value={search} onChange={e => { setSearch(e.target.value); load(e.target.value); }} />
          </div>
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Supplier Name</th><th>Company</th><th>Phone</th><th>Email</th><th>GST No.</th><th>Actions</th></tr></thead>
              <tbody>
                {suppliers.length === 0 ? <tr><td colSpan="7"><div className="empty-state"><h3>No suppliers found</h3></div></td></tr>
                  : suppliers.map((s, i) => (
                  <tr key={s._id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.company || '—'}</td>
                    <td>{s.phone}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.email || '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.gstNumber || '—'}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openView(s)} title="View"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(s)} title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s._id)} title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editData ? 'Edit Supplier' : 'Add Supplier'}
        footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" form="sup-form" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <form id="sup-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>Supplier Name *</label><input required placeholder="John Doe" value={form.name} onChange={ch('name')} /></div>
            <div className="form-group"><label>Company Name</label><input placeholder="ABC Distributors" value={form.company} onChange={ch('company')} /></div>
            <div className="form-group"><label>Phone *</label><input required placeholder="+91 98765 43210" value={form.phone} onChange={ch('phone')} /></div>
            <div className="form-group"><label>Email</label><input type="email" placeholder="supplier@email.com" value={form.email} onChange={ch('email')} /></div>
            <div className="form-group"><label>GST Number</label><input placeholder="GST12345..." value={form.gstNumber} onChange={ch('gstNumber')} /></div>
          </div>
          <div className="form-group"><label>Address</label><textarea placeholder="Full address..." value={form.address} onChange={ch('address')} /></div>
        </form>
      </Modal>

      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Supplier Details">
        {selected && (
          <div style={{ display: 'grid', gap: 12 }}>
            {[['Name', selected.name], ['Company', selected.company || '—'], ['Phone', selected.phone], ['Email', selected.email || '—'], ['GST No.', selected.gstNumber || '—'], ['Address', selected.address || '—']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{k}</span>
                <span style={{ fontWeight: 500, fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
