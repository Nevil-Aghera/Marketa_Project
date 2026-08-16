import { useEffect, useState } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!isAdmin) return <Navigate to="/" />;

  const load = async () => {
    try {
      const { data } = await API.get('/auth/pending');
      setManagers(data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const action = async (id, act) => {
    try {
      await API.patch(`/auth/approve/${id}`, { action: act });
      toast.success(act === 'approve' ? 'Manager approved!' : 'Manager rejected');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>Admin Panel</h1><p>Manage manager registration requests</p></div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>
          Pending Approval Requests
          <span className="badge badge-warning" style={{ marginLeft: 10 }}>{managers.length}</span>
        </h3>

        {loading ? <LoadingSpinner /> : managers.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h3>No pending requests</h3>
            <p>All managers have been reviewed.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Shop Name</th><th>Registered</th><th>Actions</th></tr></thead>
              <tbody>
                {managers.map(m => (
                  <tr key={m._id}>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{m.email}</td>
                    <td>{m.shopName || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(m.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-success btn-sm" onClick={() => action(m._id, 'approve')}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => action(m._id, 'reject')}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Reject
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
    </div>
  );
}
