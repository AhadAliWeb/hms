import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CalendarDays, FlaskConical, Pill, AlertCircle } from 'lucide-react';

import StatCard from '../../components/shared/StatCard';
import RevenueChart from '../../components/shared/RevenueChart';
import Loader from '../../components/shared/Loader';
import { getDoctorDashboard } from '../../api/dashboardApi';
import { getMyAppointments } from '../../api/appointmentApi';

// Build last-7-days labels
function getLast7DaysLabels() {
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }));
  }
  return labels;
}

function buildChartData(appointments) {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toDateString();
    const count = appointments.filter((a) => new Date(a.date).toDateString() === dateStr).length;
    days.push({
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      Appointments: count,
    });
  }
  return days;
}

export default function DoctorDashboard() {
  const { user } = useSelector((state) => state.auth);
  const doctorId  = user?.doctorId || user?.id;

  const [stats,    setStats]    = useState(null);
  const [chartData, setChart]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [dashRes, apptRes] = await Promise.all([
          getDoctorDashboard(),
          getMyAppointments(1, 100),
        ]);
        console.log(dashRes);
        setStats(dashRes.data);
        const appts = apptRes.data?.data || apptRes.data || [];
        setChart(buildChartData(appts));
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [doctorId]);

  if (loading) return <div className="relative h-64"><Loader /></div>;

  if (error)
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
        <AlertCircle size={16} />
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Welcome back, Dr. {user?.fullName}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Today's Appointments"
          value={stats?.todayAppointments ?? 0}
          icon={<CalendarDays size={22} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Pending Lab Orders"
          value={stats?.pendingLabOrders ?? 0}
          icon={<FlaskConical size={22} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Pending Prescriptions"
          value={stats?.pendingPrescriptions ?? 0}
          icon={<Pill size={22} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Chart */}
      <RevenueChart
        type="bar"
        data={chartData}
        title="Appointments — Last 7 Days"
        dataKey="Appointments"
        nameKey="name"
        colors={['#2563EB']}
      />
    </div>
  );
}
