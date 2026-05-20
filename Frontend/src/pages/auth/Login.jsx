import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { login } from '../../api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { Activity, Eye, EyeOff, Shield, Stethoscope, Phone, Heart, Pill, Calculator } from 'lucide-react';

const ROLE_ROUTES = {
  Admin:         '/admin/dashboard',
  Doctor:        '/doctor/dashboard',
  Receptionist:  '/receptionist/appointments',
  Nurse:         '/nurse/dashboard',
  Pharmacist:    '/pharmacist/prescriptions',
  LabTechnician: '/lab/orders',
  Accountant:    '/accountant/dashboard',
  Patient:       '/patient/appointments',
};

const DEMO_ACCOUNTS = [
  { name: 'Admin',        email: 'admin@hospital.com',        password: 'Admin@123',        icon: Shield },
  { name: 'Doctor',       email: 'doctor@hospital.com',       password: 'Doctor@123',       icon: Stethoscope },
  { name: 'Receptionist', email: 'receptionist@hospital.com', password: 'Receptionist@123', icon: Phone },
  { name: 'Nurse',        email: 'nurse@hospital.com',        password: 'Nurse@123',        icon: Heart },
  { name: 'Pharmacist',   email: 'pharmacist@hospital.com',   password: 'Pharmacist@123',   icon: Pill },
  { name: 'Accountant',   email: 'accountant@hospital.com',   password: 'Accountant@123',   icon: Calculator },
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await login(form);
      const token = res.data.token;
      const decoded = jwtDecode(token);
      const role = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      const user = { id: decoded.sub || decoded.id, fullName: decoded.fullName || decoded.name || 'User', email: decoded.email };

      dispatch(setCredentials({ token, user, role }));
      navigate(ROLE_ROUTES[role] || '/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-600 rounded-xl text-white mb-3 shadow-lg">
            <Activity size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MediCore HMS</h1>
          <p className="text-sm text-gray-500 mt-1">Hospital Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@hospital.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        {/* Demo accounts */}
        <div className="mt-6">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-3">
            Quick fill — demo accounts
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DEMO_ACCOUNTS.map(({ name, email, password, icon: Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setForm({ email, password });
                  setError('');
                }}
                className="flex flex-col items-start gap-1 p-2.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left group"
              >
                <Icon size={15} className="text-gray-400 group-hover:text-blue-500" />
                <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700 leading-none">
                  {name}
                </span>
                <span className="text-[10px] text-gray-400 group-hover:text-blue-500 font-mono truncate w-full">
                  {email}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
