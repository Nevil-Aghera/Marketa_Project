import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await API.get('/purchases');
      setPurchases(data.data);
    } catch { toast.error('Failed to load purchases'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>Purchases</h1><p>Record stock purchases from suppliers</p></div>
        <Link to="/purchases/create" className="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Purchase
        </Link>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Invoice No.</th><th>Supplier</th><th>Items</th><th>Total Amount</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr><td colSpan="6"><div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                    <h3>No purchases yet</h3><p>Create your first purchase invoice</p>
                  </div></td></tr>
                ) : purchases.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{p.invoiceNumber}</td>
                    <td style={{ fontWeight: 500 }}>{p.supplier?.name || 'N/A'}</td>
                    <td><span className="badge badge-purple">{p.items.length} items</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--warning)' }}>₹{p.totalAmount.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(p.purchaseDate).toLocaleDateString('en-IN')}</td>
                    <td>
                      <Link to={`/purchases/${p._id}`} className="btn btn-ghost btn-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
