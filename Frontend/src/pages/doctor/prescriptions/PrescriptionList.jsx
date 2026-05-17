import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Plus, Eye } from 'lucide-react';

import Table from '../../../components/shared/Table';
import Badge from '../../../components/shared/Badge';
import Pagination from '../../../components/shared/Pagination';
import Modal from '../../../components/shared/Modal';
import { getMinePrescriptions } from '../../../api/prescriptionApi';

function statusVariant(status) {
  const map = { Pending: 'warning', Dispensed: 'success', Cancelled: 'danger' };
  return map[status] || 'default';
}

export default function PrescriptionList() {
  const { user }  = useSelector((s) => s.auth);
  const doctorId  = user?.doctorId || user?.id;
  const navigate  = useNavigate();

  const [data,    setData]    = useState([]);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [viewing, setViewing] = useState(null);

  

  const PAGE_SIZE = 10;

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getMinePrescriptions(page, PAGE_SIZE);
        setData(res.data);
      } catch {
        setError('Failed to load prescriptions.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, doctorId]);

  const columns = [
    { key: 'patientName', label: 'Patient' },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} variant={statusVariant(v)} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
      key: 'items',
      label: 'Items',
      render: (v) => Array.isArray(v) ? v.length : '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => setViewing(row)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Eye size={13} /> View Items
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
          <p className="text-sm text-gray-500 mt-1">Prescriptions issued by you</p>
        </div>
        <button
          onClick={() => navigate('/doctor/prescriptions/create')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Create Prescription
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
        emptyMessage="No prescriptions found."
      />

      <Pagination
        currentPage={page}
        dataLength={data.length}
        limit={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Items modal */}
      <Modal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        title="Prescription Items"
        size="lg"
      >
        {viewing?.items?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                  {['Medicine', 'Dosage', 'Frequency', 'Duration', 'Qty'].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viewing.items.map((item, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2">{item.medicineName || item.medicineId}</td>
                    <td className="px-3 py-2">{item.dosage}</td>
                    <td className="px-3 py-2">{item.frequency}</td>
                    <td className="px-3 py-2">{item.durationDays} days</td>
                    <td className="px-3 py-2">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">No items found.</p>
        )}
      </Modal>
    </div>
  );
}
