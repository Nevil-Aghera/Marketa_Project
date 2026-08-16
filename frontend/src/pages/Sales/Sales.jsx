import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get('/sales');
        setSales(data.data);
      } catch { toast.error('Failed to load sales'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const payBadge = { cash: 'badge-success', upi: 'badge-info', card: 'badge-purple' };

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>Sales</h1><p>Record and view customer sales</p></div>
        <Link to="/sales/create" className="btn btn-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Sale
        </Link>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Invoice No.</th><th>Customer</th><th>Items</th><th>Discount</th><th>Total</th><th>Payment</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr><td colSpan="8"><div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                    <h3>No sales yet</h3><p>Create your first sale invoice</p>
                  </div></td></tr>
                ) : sales.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>{s.invoiceNumber}</td>
                    <td>{s.customerName}</td>
                    <td><span className="badge badge-purple">{s.items.length} items</span></td>
                    <td>{s.discount > 0 ? <span className="badge badge-warning">₹{s.discount}</span> : '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{s.totalAmount.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${payBadge[s.paymentMethod] || 'badge-info'}`}>{s.paymentMethod?.toUpperCase()}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(s.saleDate).toLocaleDateString('en-IN')}</td>
                    <td>
                      <Link to={`/sales/${s._id}`} className="btn btn-ghost btn-sm">
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
