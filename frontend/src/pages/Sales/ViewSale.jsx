import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import API from '../../api/axios';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

export default function ViewSale() {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, stRes] = await Promise.all([API.get(`/sales/${id}`), API.get('/settings')]);
        setSale(sRes.data.data);
        setSettings(stRes.data.data);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  if (loading) return <LoadingSpinner />;
  if (!sale) return <div style={{ color: 'var(--text-muted)', padding: 40 }}>Sale not found.</div>;

  const payIcons = { cash: '💵', upi: '📱', card: '💳' };

  return (
    <div className="animate-slide">
      <div className="page-header">
        <div><h1>{sale.invoiceNumber}</h1><p>Sales Invoice</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/sales" className="btn btn-ghost">← Back</Link>
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
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>SALES INVOICE</div>
            <div className="invoice-num">{sale.invoiceNumber}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Date: {new Date(sale.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div style={{ fontSize: 12, color: '#666' }}>Payment: {payIcons[sale.paymentMethod]} {sale.paymentMethod?.toUpperCase()}</div>
          </div>
        </div>

        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f8f9fa', borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 4 }}>CUSTOMER DETAILS</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{sale.customerName}</div>
          {sale.customer?.mobile && <div style={{ fontSize: 13, color: '#555' }}>📞 {sale.customer.mobile}</div>}
          {sale.customer?.address && <div style={{ fontSize: 13, color: '#555' }}>📍 {sale.customer.address}</div>}
        </div>

        <table className="invoice-table">
          <thead>
            <tr><th>#</th><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>₹{item.sellingPrice.toLocaleString('en-IN')}</td>
                <td style={{ fontWeight: 600 }}>₹{item.totalPrice.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-total">
          <div className="invoice-total-row" style={{ color: '#555' }}>
            <span>Subtotal</span><span>₹{sale.subtotal.toLocaleString('en-IN')}</span>
          </div>
          {sale.discount > 0 && (
            <div className="invoice-total-row" style={{ color: '#e67e22' }}>
              <span>Discount</span><span>— ₹{sale.discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="invoice-total-row invoice-grand">
            <span>Total Amount</span>
            <span>₹{sale.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {sale.notes && (
          <div style={{ marginTop: 20, padding: '10px 14px', background: '#f8f9fa', borderRadius: 6, fontSize: 13 }}>
            <strong>Notes:</strong> {sale.notes}
          </div>
        )}

        <div className="invoice-footer-text">{settings.invoiceFooter || 'Thank you for shopping with us!'}</div>
      </div>
    </div>
  );
}
