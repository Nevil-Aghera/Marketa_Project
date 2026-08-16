import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/': { title: 'Dashboard', sub: 'Welcome back! Here\'s your overview.' },
  '/products': { title: 'Products', sub: 'Manage your product catalog' },
  '/categories': { title: 'Categories', sub: 'Organize products by category' },
  '/suppliers': { title: 'Suppliers', sub: 'Manage your supplier contacts' },
  '/customers': { title: 'Customers', sub: 'Track customer information' },
  '/purchases': { title: 'Purchases', sub: 'Record and track stock purchases' },
  '/purchases/create': { title: 'New Purchase', sub: 'Create a purchase invoice' },
  '/sales': { title: 'Sales', sub: 'Record and track sales' },
  '/sales/create': { title: 'New Sale', sub: 'Create a sales invoice' },
  '/inventory': { title: 'Inventory', sub: 'Monitor and manage stock levels' },
  '/reports': { title: 'Reports', sub: 'Business insights and analytics' },
  '/notifications': { title: 'Notifications', sub: 'Stock alerts and system messages' },
  '/settings': { title: 'Settings', sub: 'Configure your shop information' },
};

export default function Header() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const base = '/' + pathname.split('/')[1];
  const info = pageTitles[pathname] || pageTitles[base] || { title: 'MARKETA', sub: '' };
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'M';

  return (
    <header className="header">
      <div className="header-left">
        <h2>{info.title}</h2>
        {info.sub && <p>{info.sub}</p>}
      </div>
      <div className="header-right">
        <div className="header-user">
          <div className="user-avatar">{initials}</div>
          <span>{user?.name || 'Manager'}</span>
        </div>
      </div>
    </header>
  );
}
