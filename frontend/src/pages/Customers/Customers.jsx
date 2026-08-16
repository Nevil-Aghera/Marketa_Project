import { useEffect, useState } from 'react';
import API from '../../api/axios';
import Modal from '../../components/UI/Modal';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const empty = { name: '', mobile: '', address: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = async (q = '') => {
    try {
      const { data } = await API.get(`/customers?search=${q}`);
      setCustomers(data.data);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditData(null); setForm(empty); setModal(true); };
  const openEdit = (c) => { setEditData(c); setForm({ name: c.name, mobile: c.mobile, address: c.address || '' }); setModal(true); };

  const openHistory = async (c) => {
    try {
      const { data } = await API.get(`/customers/${c._id}`);
      setSelected(data.data);
      setHistoryModal(true);
    } catch { toast.error('Failed to load history'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editData) { await API.put(`/customers/${editData._id}`, form); toast.success('Customer updated!'); }
      else { await API.post('/customers', form); toast.success('Customer added!'); }
      setModal(false); load(search);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try { await API.delete(`/customers/${id}`); toast.success('Deleted'); load(search); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const ch = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>Customers</h1><p>Maintain customer purchase records</p></div>
        <button className="btn btn-primary" onClick={openCreate}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Customer
        </button>
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search-input-wrapper" style={{ width: 300 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search by name or mobile..." value={search} onChange={e => { setSearch(e.target.value); load(e.target.value); }} />
          </div>
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Customer Name</th><th>Mobile</th><th>Address</th><th>Total Purchases</th><th>Total Spent</th><th>Actions</th></tr></thead>
              <tbody>
                {customers.length === 0 ? <tr><td colSpan="7"><div className="empty-state"><h3>No customers found</h3></div></td></tr>
                  : customers.map((c, i) => (
                  <tr key={c._id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.mobile}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.address || '—'}</td>
                    <td><span className="badge badge-blue">{c.totalPurchases}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{c.totalSpent.toLocaleString('en-IN')}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openHistory(c)} title="Purchase History"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(c)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(c._id)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editData ? 'Edit Customer' : 'Add Customer'}
        footer={<><button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" form="cust-form" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></>}>
        <form id="cust-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label>Customer Name *</label><input required placeholder="Jane Doe" value={form.name} onChange={ch('name')} /></div>
            <div className="form-group"><label>Mobile *</label><input required placeholder="+91 99999 88888" value={form.mobile} onChange={ch('mobile')} /></div>
          </div>
          <div className="form-group"><label>Address</label><textarea placeholder="Optional address..." value={form.address} onChange={ch('address')} /></div>
        </form>
      </Modal>

      <Modal isOpen={historyModal} onClose={() => setHistoryModal(false)} title="Customer Purchase History" size="lg">
        {selected && (
          <>
            <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
              <div className="stat-card" style={{ flex: 1, minWidth: 120 }}><div className="stat-info"><div className="stat-label">Name</div><div style={{ fontWeight: 700 }}>{selected.customer.name}</div></div></div>
              <div className="stat-card" style={{ flex: 1, minWidth: 120 }}><div className="stat-info"><div className="stat-label">Total Purchases</div><div style={{ fontWeight: 700 }}>{selected.customer.totalPurchases}</div></div></div>
              <div className="stat-card" style={{ flex: 1, minWidth: 120 }}><div className="stat-info"><div className="stat-label">Total Spent</div><div style={{ fontWeight: 700, color: 'var(--success)' }}>₹{selected.customer.totalSpent.toLocaleString('en-IN')}</div></div></div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Invoice</th><th>Date</th><th>Amount</th><th>Payment</th></tr></thead>
                <tbody>
                  {selected.purchases.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No purchases yet</td></tr>
                    : selected.purchases.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{p.invoiceNumber}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(p.saleDate).toLocaleDateString('en-IN')}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{p.totalAmount.toLocaleString('en-IN')}</td>
                      <td><span className="badge badge-info">{p.paymentMethod}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
