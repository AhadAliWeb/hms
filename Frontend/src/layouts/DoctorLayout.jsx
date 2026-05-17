import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Pill,
  FlaskConical,
} from 'lucide-react';

import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';
import { logout } from '../store/slices/authSlice';

const DOCTOR_LINKS = [
  { label: 'Dashboard',        path: '/doctor/dashboard',         icon: LayoutDashboard },
  { label: 'My Appointments',  path: '/doctor/appointments',      icon: CalendarDays },
  { label: 'Medical Records',  path: '/doctor/medical-records',   icon: FileText },
  { label: 'Prescriptions',    path: '/doctor/prescriptions',     icon: Pill },
  { label: 'Lab Orders',       path: '/doctor/lab-orders',        icon: FlaskConical },
];

export default function DoctorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        links={DOCTOR_LINKS}
        role="Doctor"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar
          title="MediCore HMS"
          user={{ ...user, role: 'Doctor' }}
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
