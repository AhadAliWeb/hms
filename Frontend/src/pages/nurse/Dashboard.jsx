import { useEffect, useState } from 'react';
import { BedDouble, Users, CheckSquare } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../../components/shared/StatCard';
import Loader from '../../components/shared/Loader';
import { getNurseDashboard } from '../../api/dashboardApi';

export default function NurseDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await getNurseDashboard();
        setData(res.data);
      } catch {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
        {error}
      </div>
    );
  }

  /* Build chart data from wards array */
  const chartData = (data?.wards ?? []).map((w) => ({
    name: w.name,
    Available: w.availableBeds,
    Occupied: w.totalBeds - w.availableBeds,
  }));

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Ward &amp; bed overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Admitted Patients"
          value={data?.totalAdmittedPatients ?? 0}
          icon={<Users size={22} />}
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Total Beds"
          value={data?.totalBeds ?? 0}
          icon={<BedDouble size={22} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Available Beds"
          value={data?.availableBeds ?? 0}
          icon={<CheckSquare size={22} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
      </div>

      {/* Grouped Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Bed Availability by Ward
        </h3>

        {chartData.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No ward data available.</p>
        ) : (
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                barCategoryGap="30%"
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '0.8125rem',
                  }}
                  cursor={{ fill: '#F9FAFB' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '0.8125rem', paddingTop: '16px' }}
                />
                <Bar dataKey="Available" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Occupied"  fill="#F87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
