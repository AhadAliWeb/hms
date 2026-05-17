import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  CalendarDays,
  FileText,
  ClipboardList,
  FlaskConical,
  Receipt,
} from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';
import { logout } from '../store/slices/authSlice';

const patientLinks = [
  { label: 'My Appointments',    path: '/patient/appointments',    icon: CalendarDays },
  { label: 'My Medical Records', path: '/patient/medical-records', icon: FileText },
  { label: 'My Prescriptions',   path: '/patient/prescriptions',   icon: ClipboardList },
  { label: 'My Lab Results',     path: '/patient/lab-results',     icon: FlaskConical },
  { label: 'My Invoices',        path: '/patient/invoices',        icon: Receipt },
];

export default function PatientLayout() {
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
        links={patientLinks}
        role="Patient"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          title="Patient Portal"
          user={user}
          role="Patient"
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