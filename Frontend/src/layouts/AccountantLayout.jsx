import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, FileText } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';
import { logout } from '../store/slices/authSlice';

const LINKS = [
  { label: 'Dashboard', path: '/accountant/dashboard', icon: LayoutDashboard },
  { label: 'Invoices',  path: '/accountant/invoices',  icon: FileText },
];

export default function AccountantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const user       = useSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        links={LINKS}
        role="Accountant"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          title="MediCore HMS"
          user={user}
          role="Accountant"
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
