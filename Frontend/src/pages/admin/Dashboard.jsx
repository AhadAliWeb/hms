import { useEffect, useState } from 'react';
import { Users, UserRound, CalendarCheck, BedDouble, Pill, DollarSign, TrendingUp } from 'lucide-react';
import StatCard     from '../../components/shared/StatCard';
import RevenueChart from '../../components/shared/RevenueChart';
import { getAdminDashboard } from '../../api/dashboardApi';

// Fallback mock data so charts always render
const MOCK_REVENUE = [
  { name: 'Nov', value: 42000 },
  { name: 'Dec', value: 56000 },
  { name: 'Jan', value: 38000 },
  { name: 'Feb', value: 61000 },
  { name: 'Mar', value: 74000 },
  { name: 'Apr', value: 89000 },
];

const MOCK_BEDS = [
  { name: 'Occupied',  value: 68 },
  { name: 'Available', value: 32 },
];

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [revenueData, setRevenueData] = useState(MOCK_REVENUE);
  const [bedData, setBedData]         = useState(MOCK_BEDS);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAdminDashboard();
        const d   = res.data;
        setStats(d);
        if (d.monthlyRevenue?.length) setRevenueData(d.monthlyRevenue);
        if (d.bedOccupancy)           setBedData([
          { name: 'Occupied',  value: d.bedOccupancy.occupied  },
          { name: 'Available', value: d.bedOccupancy.available },
        ]);
      } catch {
        setError('Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const s = (key, fallback = 0) => (loading ? '…' : stats?.[key] ?? fallback);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Hospital-wide overview</p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Total Patients"        value={s('totalPatients')}         icon={<Users size={22}/>}        iconBg="bg-blue-100"   iconColor="text-blue-600" />
        <StatCard title="Total Doctors"         value={s('totalDoctors')}          icon={<UserRound size={22}/>}    iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatCard title="Today's Appointments"  value={s('todaysAppointments')}    icon={<CalendarCheck size={22}/>} iconBg="bg-teal-100"  iconColor="text-teal-600" />
        <StatCard title="Available Beds"        value={s('availableBeds')}         icon={<BedDouble size={22}/>}   iconBg="bg-indigo-100" iconColor="text-indigo-600" />
        <StatCard title="Low Stock Medicines"   value={s('lowStockMedicines')}     icon={<Pill size={22}/>}        iconBg="bg-red-100"    iconColor="text-red-600" />
        <StatCard title="Today's Revenue"       value={s('todaysRevenue')}         icon={<DollarSign size={22}/>}  iconBg="bg-green-100"  iconColor="text-green-600" prefix="$" />
        <StatCard title="Monthly Revenue"       value={s('monthlyRevenue')}        icon={<TrendingUp size={22}/>}  iconBg="bg-amber-100"  iconColor="text-amber-600" prefix="$" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            type="bar"
            title="Monthly Revenue (Last 6 Months)"
            data={revenueData}
            dataKey="value"
            nameKey="name"
          />
        </div>
        <div>
          <RevenueChart
            type="pie"
            title="Bed Occupancy"
            data={bedData}
            dataKey="value"
            nameKey="name"
            colors={['#2563EB', '#10B981']}
          />
        </div>
      </div>
    </div>
  );
}
