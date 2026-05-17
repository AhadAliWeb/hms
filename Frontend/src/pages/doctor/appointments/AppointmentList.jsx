import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { AlertCircle, CheckCircle2, Eye, Plus } from 'lucide-react';

import Table from '../../../components/shared/Table';
import Badge from '../../../components/shared/Badge';
import Pagination from '../../../components/shared/Pagination';
import Modal from '../../../components/shared/Modal';
import Loader from '../../../components/shared/Loader';
import { getMyAppointments, updateAppointmentStatus } from '../../../api/appointmentApi';
import { Link } from 'react-router-dom';

const STATUS_FILTER_OPTIONS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

function statusVariant(status) {
  const map = {
    Pending:   'warning',
    Confirmed: 'info',
    Completed: 'success',
    Cancelled: 'danger',
  };
  return map[status] || 'default';
}

export default function AppointmentList() {
  const { user }   = useSelector((s) => s.auth);
  const doctorId   = user?.doctorId || user?.id;

  const [data,      setData]      = useState([]);
  const [page,      setPage]      = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [filter,    setFilter]    = useState('All');
  const [selected,  setSelected]  = useState(null); // for patient modal
  const [completing, setCompleting] = useState(null);

  const PAGE_SIZE = 10;

  const fetchData = async (p = 1) => {
    try {
      setLoading(true);
      setError('');
      const res = await getMyAppointments(p, PAGE_SIZE);
      setData(res.data);
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page]);

  const handleMarkCompleted = async (row) => {
    try {
      setCompleting(row.id);
      await updateAppointmentStatus(row.id, 'Completed');
      fetchData(page);
    } catch {
      alert('Failed to update status.');
    } finally {
      setCompleting(null);
    }
  };

  const filtered = filter === 'All' ? data : data.filter((r) => r.status === filter);

  const columns = [
    { key: 'patientName', label: 'Patient' },
    {
      key: 'appointmentDate',
      label: 'Date',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} variant={statusVariant(v)} />,
    },
    { key: 'notes', label: 'Notes', render: (v) => v || '—' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex flex-wrap gap-2">
          {row.status === 'Scheduled' && (
            <button
              onClick={() => handleMarkCompleted(row)}
              disabled={completing === row.id}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle2 size={13} />
              {completing === row.id ? 'Updating…' : 'Complete'}
            </button>
          )}
          {
            row.status == "Completed" && (
              <Link to={`/doctor/medical-records/create/${row.id}/${row.patientId}`}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"

              >
                <Plus size={15} />
                Create Record
              </Link>
            )
          }
          <button
            onClick={() => setSelected(row)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Eye size={13} />
            View Patient
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
        <p className="text-sm text-gray-500 mt-1">View and manage your scheduled appointments</p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              filter === opt
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        isLoading={loading}
        emptyMessage="No appointments found."
      />

      <Pagination
        currentPage={page}
        dataLength={data.length}
        limit={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Patient detail modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Patient Details"
        size="md"
      >
        {selected && (
          <dl className="space-y-3 text-sm">
            {[
              ['Patient Name', selected.patientName],
              ['Appointment Date', selected.appointmentDate ? new Date(selected.appointmentDate).toLocaleString() : '—'],
              ['Status', selected.status],
              ['Notes', selected.notes || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-gray-100 pb-2 last:border-0">
                <dt className="text-gray-500 font-medium">{label}</dt>
                <dd className="text-gray-800 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  );
}
