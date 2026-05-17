import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Users, CalendarDays, BedDouble } from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';
import { logout } from '../store/slices/authSlice';

const links = [
  { label: 'Patients',     path: '/receptionist/patients',     icon: Users },
  { label: 'Appointments', path: '/receptionist/appointments', icon: CalendarDays },
  { label: 'Admissions',   path: '/receptionist/admissions',   icon: BedDouble },
];

export default function ReceptionistLayout() {
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
        links={links}
        role="Receptionist"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          title="Receptionist Portal"
          user={user}
          role="Receptionist"
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
