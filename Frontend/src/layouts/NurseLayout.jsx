import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, Users } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';
import { logout } from '../store/slices/authSlice';

const NAV_LINKS = [
  { label: 'Dashboard',    path: '/nurse/dashboard', icon: LayoutDashboard },
  { label: 'Admissions',  path: '/nurse/admissions', icon: LayoutDashboard },
  { label: 'Ward Patients', path: '/nurse/ward-patients', icon: Users },
];

export default function NurseLayout() {
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
      {/* Sidebar */}
      <Sidebar
        links={NAV_LINKS}
        role="Nurse"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          title="Nurse Portal"
          user={user}
          role="Nurse"
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
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
