import { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  CheckCircle,
  Clock,
} from 'lucide-react';
import StatCard    from '../../components/shared/StatCard';
import RevenueChart from '../../components/shared/RevenueChart';
import Loader      from '../../components/shared/Loader';
import { getAccountantDashboard } from '../../api/dashboardApi';

export default function AccountantDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getAccountantDashboard();
        setData(res.data);
      } catch {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="relative h-64"><Loader message="Loading dashboard..." /></div>;
  if (error)   return <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-sm">{error}</div>;

  const fmt = (n) => `PKR ${Number(n ?? 0).toLocaleString()}`;

  const barData = [
    { name: 'Paid',   value: data?.paidInvoices   ?? 0 },
    { name: 'Unpaid', value: data?.unpaidInvoices  ?? 0 },
  ];

  const pieData = [
    { name: 'Paid Revenue',   value: Number(data?.paidRevenue   ?? 0) },
    { name: 'Unpaid Revenue', value: Number(data?.unpaidRevenue ?? 0) },
  ];

  const stats = [
    {
      title: 'Total Revenue',
      value: fmt(data?.totalRevenue),
      icon: <DollarSign size={20} />,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Paid Revenue',
      value: fmt(data?.paidRevenue),
      icon: <TrendingUp size={20} />,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Unpaid Revenue',
      value: fmt(data?.unpaidRevenue),
      icon: <TrendingDown size={20} />,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Total Invoices',
      value: data?.totalInvoices ?? 0,
      icon: <FileText size={20} />,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Paid Invoices',
      value: data?.paidInvoices ?? 0,
      icon: <CheckCircle size={20} />,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Unpaid Invoices',
      value: data?.unpaidInvoices ?? 0,
      icon: <Clock size={20} />,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Accountant Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Financial overview and invoice summary</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart
          type="bar"
          data={barData}
          title="Paid vs Unpaid Invoices"
          dataKey="value"
          nameKey="name"
          colors={['#16A34A', '#DC2626']}
        />
        <RevenueChart
          type="pie"
          data={pieData}
          title="Revenue Split (Paid vs Unpaid)"
          dataKey="value"
          nameKey="name"
          colors={['#16A34A', '#DC2626']}
        />
      </div>
    </div>
  );
}
