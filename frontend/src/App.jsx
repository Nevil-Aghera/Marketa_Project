import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products/Products';
import Categories from './pages/Categories/Categories';
import Suppliers from './pages/Suppliers/Suppliers';
import Customers from './pages/Customers/Customers';
import Purchases from './pages/Purchases/Purchases';
import CreatePurchase from './pages/Purchases/CreatePurchase';
import ViewPurchase from './pages/Purchases/ViewPurchase';
import Sales from './pages/Sales/Sales';
import CreateSale from './pages/Sales/CreateSale';
import ViewSale from './pages/Sales/ViewSale';
import Inventory from './pages/Inventory/Inventory';
import Reports from './pages/Reports/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="customers" element={<Customers />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="purchases/create" element={<CreatePurchase />} />
        <Route path="purchases/:id" element={<ViewPurchase />} />
        <Route path="sales" element={<Sales />} />
        <Route path="sales/create" element={<CreateSale />} />
        <Route path="sales/:id" element={<ViewSale />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#ffffff', color: '#1a2e22', border: '1px solid #e2e8e4', boxShadow: '0 10px 30px rgba(15,59,47,0.1)' },
            success: { iconTheme: { primary: '#15803d', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#b91c1c', secondary: '#ffffff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
