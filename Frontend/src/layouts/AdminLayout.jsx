// import { useDispatch, useSelector } from 'react-redux';
// import { Outlet, useNavigate } from 'react-router-dom';
// import { LayoutDashboard, UserRound, Users, BedDouble, Pill, FlaskConical, ScrollText } from 'lucide-react';
// import Sidebar from '../components/shared/Sidebar';
// import Navbar  from '../components/shared/Navbar';
// import { logout } from '../store/slices/authSlice';

// const LINKS = [
//   { label: 'Dashboard',   path: '/admin/dashboard',   icon: LayoutDashboard },
//   { label: 'Doctors',     path: '/admin/doctors',      icon: UserRound },
//   { label: 'Patients',    path: '/admin/patients',     icon: Users },
//   { label: 'Wards & Beds',path: '/admin/wards',        icon: BedDouble },
//   { label: 'Medicines',   path: '/admin/medicines',    icon: Pill },
//   { label: 'Lab Tests',   path: '/admin/lab-tests',    icon: FlaskConical },
//   { label: 'Audit Logs',  path: '/admin/audit-logs',   icon: ScrollText },
// ];

// export default function AdminLayout() {
//   const dispatch  = useDispatch();
//   const navigate  = useNavigate();
//   const { user }  = useSelector((state) => state.auth);

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate('/login');
//   };

//   return (
//     <div className="flex h-screen overflow-hidden bg-gray-50">
//       <Sidebar links={LINKS} role="Admin" />

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Navbar
//           title="MediCore HMS"
//           user={{ ...user, role: 'Admin' }}
//           onLogout={handleLogout}
//         />
//         <main className="flex-1 overflow-y-auto p-6">
//           <div className="max-w-7xl mx-auto">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// AdminLayout.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserRound,
  Users,
  BedDouble,
  Pill,
  FlaskConical,
  ScrollText,
} from 'lucide-react';

import Sidebar from '../components/shared/Sidebar';
import Navbar from '../components/shared/Navbar';
import { logout } from '../store/slices/authSlice';

const LINKS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Doctors', path: '/admin/doctors', icon: UserRound },
  { label: 'Patients', path: '/admin/patients', icon: Users },
  { label: 'Wards & Beds', path: '/admin/wards', icon: BedDouble },
  { label: 'Medicines', path: '/admin/medicines', icon: Pill },
  { label: 'Lab Tests', path: '/admin/lab-tests', icon: FlaskConical },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        links={LINKS}
        role="Admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          title="MediCore HMS"
          user={{ ...user, role: 'Admin' }}
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}