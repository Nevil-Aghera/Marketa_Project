import { useEffect, useState } from 'react';
import API from '../api/axios';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await API.get('/notifications');
      setData(res.data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await API.patch(`/notifications/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    await API.patch('/notifications/read-all');
    toast.success('All marked as read');
    load();
  };

  const deleteNotif = async (id) => {
    await API.delete(`/notifications/${id}`);
    load();
  };

  const typeIcon = { low_stock: '⚠️', out_of_stock: '🚫', info: 'ℹ️' };
  const typeBadge = { low_stock: 'badge-warning', out_of_stock: 'badge-danger', info: 'badge-info' };

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>{data.unreadCount} unread alert{data.unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {data.unreadCount > 0 && (
          <button className="btn btn-ghost" onClick={markAllRead}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>
            Mark All Read
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card">
          {data.notifications.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              <h3>No notifications</h3>
              <p>All clear! You have no stock alerts.</p>
            </div>
          ) : (
            data.notifications.map(n => (
              <div key={n._id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                background: n.isRead ? 'transparent' : 'rgba(108,99,255,0.05)',
                borderRadius: n.isRead ? 0 : 8, marginBottom: 2
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{typeIcon[n.type] || 'ℹ️'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: n.isRead ? 400 : 600, color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    {n.message}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center' }}>
                    <span className={`badge ${typeBadge[n.type] || 'badge-info'}`}>{n.type?.replace('_', ' ')}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</span>
                    {!n.isRead && <span style={{ fontSize: 10, background: 'var(--accent)', color: '#fff', padding: '1px 6px', borderRadius: 8, fontWeight: 700 }}>NEW</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {!n.isRead && (
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => markRead(n._id)} title="Mark as read">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                  )}
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteNotif(n._id)} title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
