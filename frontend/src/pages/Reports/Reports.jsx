import { useEffect, useState } from 'react';
import API from '../../api/axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6c63ff', '#00d97e', '#ffb946', '#f05252', '#3b82f6', '#a78bfa'];

export default function Reports() {
  const [tab, setTab] = useState('sales');
  const [salesData, setSalesData] = useState({ salesData: [], topProducts: [], paymentMethods: [] });
  const [purchaseData, setPurchaseData] = useState({ purchaseData: [], topSuppliers: [] });
  const [inventoryData, setInventoryData] = useState({});
  const [customerData, setCustomerData] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const loadSales = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/reports/sales?period=${period}`);
      setSalesData(data.data);
    } catch { } finally { setLoading(false); }
  };

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/reports/purchases');
      setPurchaseData(data.data);
    } catch { } finally { setLoading(false); }
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/reports/inventory');
      setInventoryData(data.data);
    } catch { } finally { setLoading(false); }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/reports/customers');
      setCustomerData(data.data);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'sales') loadSales();
    if (tab === 'purchases') loadPurchases();
    if (tab === 'inventory') loadInventory();
    if (tab === 'customers') loadCustomers();
  }, [tab, period]);

  const tipStyle = { background: '#131d2e', border: '1px solid #1e2d45', borderRadius: 8, color: '#e2e8f0' };

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>Reports</h1><p>Business insights and analytics</p></div>
      </div>

      <div className="tabs" style={{ maxWidth: 460, marginBottom: 24 }}>
        {['sales', 'purchases', 'inventory', 'customers'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {tab === 'sales' && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>Sales Revenue</h3>
                  <select style={{ width: 140 }} value={period} onChange={e => setPeriod(e.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={salesData.salesData}>
                    <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3}/><stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Sales']} contentStyle={tipStyle} />
                    <Area type="monotone" dataKey="totalSales" stroke="#6c63ff" fill="url(#sg)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid-2">
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Top Products</h3>
                  <div className="table-wrapper">
                    <table>
                      <thead><tr><th>Product</th><th>Qty Sold</th><th>Revenue</th></tr></thead>
                      <tbody>
                        {salesData.topProducts.map((p, i) => (
                          <tr key={i}><td>{p._id}</td><td>{p.totalQty}</td><td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{p.totalRevenue.toLocaleString('en-IN')}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Payment Methods</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart><Pie data={salesData.paymentMethods} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={70} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                      {salesData.paymentMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie><Tooltip contentStyle={tipStyle} formatter={v => `₹${v.toLocaleString('en-IN')}`} /></PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {tab === 'purchases' && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Monthly Purchase Expenses</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={purchaseData.purchaseData}>
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Purchases']} contentStyle={tipStyle} />
                    <Bar dataKey="totalPurchases" fill="#ffb946" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Top Suppliers</h3>
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Supplier</th><th>Orders</th><th>Total Amount</th></tr></thead>
                    <tbody>
                      {purchaseData.topSuppliers?.map((s, i) => (
                        <tr key={i}><td style={{ fontWeight: 500 }}>{s.supplier?.name}</td><td>{s.count}</td><td style={{ color: 'var(--warning)', fontWeight: 600 }}>₹{s.total?.toLocaleString('en-IN')}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'inventory' && inventoryData.totalStock && (
            <div style={{ display: 'grid', gap: 20 }}>
              <div className="stats-grid">
                <div className="stat-card"><div className="stat-icon green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                  <div className="stat-info"><div className="stat-label">Total Stock Items</div><div className="stat-value">{inventoryData.totalStock.totalItems}</div></div></div>
                <div className="stat-card"><div className="stat-icon purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
                  <div className="stat-info"><div className="stat-label">Stock Value</div><div className="stat-value">₹{inventoryData.totalStock.totalValue?.toLocaleString('en-IN')}</div></div></div>
                <div className="stat-card"><div className="stat-icon orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg></div>
                  <div className="stat-info"><div className="stat-label">Low Stock Products</div><div className="stat-value">{inventoryData.lowStock?.length || 0}</div></div></div>
                <div className="stat-card"><div className="stat-icon red"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
                  <div className="stat-info"><div className="stat-label">Out of Stock</div><div className="stat-value">{inventoryData.outOfStock?.length || 0}</div></div></div>
              </div>
              <div className="grid-2">
                {inventoryData.lowStock?.length > 0 && (
                  <div className="card">
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>⚠️ Low Stock Products</h3>
                    {inventoryData.lowStock.map(p => (
                      <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 13 }}>{p.name}</span>
                        <span className="badge badge-warning">{p.stock} {p.unit}(s)</span>
                      </div>
                    ))}
                  </div>
                )}
                {inventoryData.categoryWise?.length > 0 && (
                  <div className="card">
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Stock by Category</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart><Pie data={inventoryData.categoryWise} dataKey="totalStock" nameKey="category.name" cx="50%" cy="50%" outerRadius={70} label={({ name }) => name}>
                        {inventoryData.categoryWise.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie><Tooltip contentStyle={tipStyle} /></PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'customers' && (
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Top Customers by Spending</h3>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>#</th><th>Customer</th><th>Mobile</th><th>Total Purchases</th><th>Total Spent</th></tr></thead>
                  <tbody>
                    {customerData.length === 0 ? <tr><td colSpan="5"><div className="empty-state"><h3>No customer data</h3></div></td></tr>
                      : customerData.map((c, i) => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>#{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{c.mobile}</td>
                        <td><span className="badge badge-info">{c.totalPurchases} orders</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{c.totalSpent.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
