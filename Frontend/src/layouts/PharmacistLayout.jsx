import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ClipboardList, Package, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';
import { logout } from '../store/slices/authSlice';

const links = [
  { label: 'Prescriptions',     path: '/pharmacist/prescriptions',  icon: ClipboardList },
  { label: 'Medicines',         path: '/pharmacist/medicines',       icon: Package },
  { label: 'Low Stock Alerts',  path: '/pharmacist/low-stock',       icon: AlertTriangle },
];

export default function PharmacistLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        links={links}
        role="Pharmacist"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          title="MediCore HMS"
          user={user}
          role="Pharmacist"
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}