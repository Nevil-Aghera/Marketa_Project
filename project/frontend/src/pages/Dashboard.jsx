import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import StatCard from '../components/UI/StatCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/dashboard');
        setStats(data.data);
        // Build simple chart data from recent sales
        const salesRes = await API.get('/reports/sales?period=monthly');
        setChartData(salesRes.data.data.salesData.map(d => ({ month: d._id, sales: d.totalSales, count: d.count })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="animate-slide">
      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard label="Total Products" value={stats.counts.totalProducts} color="purple"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>} />
        <StatCard label="Total Categories" value={stats.counts.totalCategories} color="blue"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>} />
        <StatCard label="Total Suppliers" value={stats.counts.totalSuppliers} color="orange"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>} />
        <StatCard label="Total Customers" value={stats.counts.totalCustomers} color="green"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} />
        <StatCard label="Total Income" value={fmt(stats.financials.totalIncome)} sub={`Today: ${fmt(stats.sales.todayAmount)}`} color="green"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>} />
        <StatCard label="Total Expenses" value={fmt(stats.financials.totalExpenses)} sub={`Today: ${fmt(stats.purchases.todayAmount)}`} color="red"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/></svg>} />
        <StatCard label="Total Profit" value={fmt(stats.financials.totalProfit)} color={stats.financials.totalProfit >= 0 ? 'green' : 'red'}
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>} />
        <StatCard label="Low Stock Alerts" value={stats.stockAlerts.lowStockProducts.length + stats.stockAlerts.outOfStockProducts.length} color="orange"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>} />
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>Monthly Sales Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Sales']} contentStyle={{ background: '#131d2e', border: '1px solid #1e2d45', borderRadius: 8, color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="sales" stroke="#6c63ff" fill="url(#salesGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600 }}>Sales Count per Month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#131d2e', border: '1px solid #1e2d45', borderRadius: 8, color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#00d97e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-2">
        {/* Recent Sales */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Recent Sales</h3>
            <Link to="/sales" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {stats.recentActivity.recentSales.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No sales yet</p>
          ) : (
            stats.recentActivity.recentSales.map(sale => (
              <div key={sale._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{sale.invoiceNumber}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{sale.customerName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: 14 }}>₹{sale.totalAmount.toLocaleString('en-IN')}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{new Date(sale.saleDate).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stock Alerts */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>⚠️ Stock Alerts</h3>
            <Link to="/inventory" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {stats.stockAlerts.outOfStockProducts.length === 0 && stats.stockAlerts.lowStockProducts.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontSize: 13 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              All products are well-stocked!
            </div>
          ) : (
            <>
              {stats.stockAlerts.outOfStockProducts.map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                  <span className="badge badge-danger">Out of Stock</span>
                </div>
              ))}
              {stats.stockAlerts.lowStockProducts.map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.stock} {p.unit}(s) left (min: {p.minStock})</div>
                  </div>
                  <span className="badge badge-warning">Low Stock</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
