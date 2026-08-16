import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import API from '../../api/axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function ViewPurchase() {
  const { id } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, sRes] = await Promise.all([API.get(`/purchases/${id}`), API.get('/settings')]);
        setPurchase(pRes.data.data);
        setSettings(sRes.data.data);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  if (loading) return <LoadingSpinner />;
  if (!purchase) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Purchase not found.</div>;

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>{purchase.invoiceNumber}</h1><p>Purchase Invoice</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/purchases" className="btn btn-ghost">← Back</Link>
          <button className="btn btn-primary" onClick={handlePrint}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Invoice
          </button>
        </div>
      </div>

      <div ref={printRef} className="invoice-wrapper">
        <div className="invoice-header">
          <div>
            <div className="invoice-title">{settings.shopName || 'MARKETA'}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{settings.address || ''}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{settings.phone || ''}</div>
            {settings.gstNumber && <div style={{ fontSize: 12, color: '#666' }}>GST: {settings.gstNumber}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>PURCHASE INVOICE</div>
            <div className="invoice-num">{purchase.invoiceNumber}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Date: {new Date(purchase.purchaseDate).toLocaleDateString('en-IN')}</div>
          </div>
        </div>

        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 4 }}>SUPPLIER DETAILS</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{purchase.supplier?.name}</div>
          {purchase.supplier?.company && <div style={{ fontSize: 13, color: '#555' }}>{purchase.supplier.company}</div>}
          {purchase.supplier?.phone && <div style={{ fontSize: 13, color: '#555' }}>📞 {purchase.supplier.phone}</div>}
          {purchase.supplier?.email && <div style={{ fontSize: 13, color: '#555' }}>✉️ {purchase.supplier.email}</div>}
          {purchase.supplier?.gstNumber && <div style={{ fontSize: 13, color: '#555' }}>GST: {purchase.supplier.gstNumber}</div>}
        </div>

        <table className="invoice-table">
          <thead>
            <tr><th>#</th><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            {purchase.items.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>₹{item.purchasePrice.toLocaleString('en-IN')}</td>
                <td style={{ fontWeight: 600 }}>₹{item.totalPrice.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-total">
          <div className="invoice-total-row invoice-grand">
            <span>Total Amount</span>
            <span>₹{purchase.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {purchase.notes && (
          <div style={{ marginTop: 20, padding: '10px 14px', background: '#f8f9fa', borderRadius: 6, fontSize: 13 }}>
            <strong>Notes:</strong> {purchase.notes}
          </div>
        )}

        <div className="invoice-footer-text">{settings.invoiceFooter || 'Thank you for your business!'}</div>
      </div>
    </div>
  );
}
