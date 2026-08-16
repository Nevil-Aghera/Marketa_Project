import { useEffect, useState } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Settings() {
  const [form, setForm] = useState({ shopName: '', gstNumber: '', phone: '', address: '', currency: '₹', invoiceFooter: '' });
  const [logo, setLogo] = useState(null);
  const [currentLogo, setCurrentLogo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get('/settings');
        const s = data.data;
        setForm({ shopName: s.shopName || '', gstNumber: s.gstNumber || '', phone: s.phone || '', address: s.address || '', currency: s.currency || '₹', invoiceFooter: s.invoiceFooter || '' });
        setCurrentLogo(s.logo || '');
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logo) fd.append('logo', logo);
      await API.put('/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Settings saved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving settings'); }
    finally { setSaving(false); }
  };

  const ch = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>Shop Settings</h1><p>Configure your supermarket information</p></div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Shop Information</h3>
          <div className="form-group">
            <label>Shop Name</label>
            <input placeholder="MARKETA Supermarket" value={form.shopName} onChange={ch('shopName')} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input placeholder="+91 98765 43210" value={form.phone} onChange={ch('phone')} />
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input placeholder="GST12345..." value={form.gstNumber} onChange={ch('gstNumber')} />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea placeholder="Shop address..." value={form.address} onChange={ch('address')} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Currency Symbol</label>
              <select value={form.currency} onChange={ch('currency')}>
                <option value="₹">₹ (INR)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Invoice Settings</h3>
          <div className="form-group">
            <label>Invoice Footer Message</label>
            <textarea placeholder="Thank you for shopping with us!" value={form.invoiceFooter} onChange={ch('invoiceFooter')} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Shop Logo</h3>
          {currentLogo && (
            <div style={{ marginBottom: 16 }}>
              <img src={`https://marketa-mu-project.onrender.com${currentLogo}`} alt="Current Logo" style={{ height: 80, borderRadius: 8, border: '1px solid var(--border)' }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Current logo</p>
            </div>
          )}
          <div className="form-group">
            <label>Upload New Logo</label>
            <input type="file" accept="image/*" onChange={e => setLogo(e.target.files[0])} style={{ padding: '8px' }} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '12px 32px' }}>
          {saving ? 'Saving...' : '💾 Save Settings'}
        </button>
      </form>
    </div>
  );
}
