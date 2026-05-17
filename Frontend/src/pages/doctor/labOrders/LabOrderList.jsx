import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus } from 'lucide-react';

import Table from '../../../components/shared/Table';
import Badge from '../../../components/shared/Badge';
import Pagination from '../../../components/shared/Pagination';
import { getMyLabOrders } from '../../../api/labOrderApi';

function statusVariant(status) {
  const map = { Pending: 'warning', InProgress: 'info', Completed: 'success', Cancelled: 'danger' };
  return map[status] || 'default';
}

export default function LabOrderList() {
  const { user }  = useSelector((s) => s.auth);
  const doctorId  = user?.doctorId || user?.id;
  const navigate  = useNavigate();

  const [data,    setData]    = useState([]);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getMyLabOrders(page, PAGE_SIZE);
        setData(res.data?.data || res.data || []);
      } catch {
        setError('Failed to load lab orders.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, doctorId]);

  const columns = [
    { key: 'patientName', label: 'Patient' },
    { key: 'labTestName', label: 'Lab Test', render: (v) => v || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} variant={statusVariant(v)} />,
    },
    { key: 'notes', label: 'Notes', render: (v) => v || '—' },
    {
      key: 'createdAt',
      label: 'Date',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lab Orders</h2>
          <p className="text-sm text-gray-500 mt-1">Lab tests ordered for your patients</p>
        </div>
        <button
          onClick={() => navigate('/doctor/lab-orders/create')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Create Lab Order
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <Table
        columns={columns}
        data={data}
        isLoading={loading}
        emptyMessage="No lab orders found."
      />

      <Pagination
        currentPage={page}
        dataLength={data.length}
        limit={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
