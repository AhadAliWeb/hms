import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, XCircle, Pencil } from 'lucide-react';
import { getAllAppointments, updateAppointmentStatus } from '../../../api/appointmentApi';
import Table from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Badge from '../../../components/shared/Badge';
import Modal from '../../../components/shared/Modal';
import AppointmentReschedule from './AppointmentReschedule';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ['', 'Completed', 'Cancelled', 'Scheduled'];

const statusVariant = (s) => {
  if (s === 'Completed') return 'success';
  if (s === 'Cancelled') return 'danger';
  if (s === 'Confirmed') return 'info';
  return 'warning';
};

export default function AppointmentList() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [page, setPage]                 = useState(1);
  const [status, setStatus]             = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);


  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getAllAppointments(page, PAGE_SIZE, '', status);
      setAppointments(res.data?.data ?? res.data ?? []);
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  }, [page, status]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    try {
      await updateAppointmentStatus(cancelTarget.id, 'Cancelled');
      setCancelTarget(null);
      fetchAppointments();
    } catch {
      setError('Failed to cancel appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'patientName',     label: 'Patient',
      render: (_, row) => row.patient?.fullName ?? row.patientName ?? '—' },
    { key: 'doctorName',      label: 'Doctor',
      render: (_, row) => row.doctor?.fullName ?? row.doctorName ?? '—' },
    { key: 'appointmentDate', label: 'Date',
      render: (v) => v ? new Date(v).toLocaleString() : '—' },
    { key: 'status',          label: 'Status',
      render: (v) => <Badge label={v} variant={statusVariant(v)} /> },
    { key: 'notes',           label: 'Notes',
      render: (v) => <span className="max-w-xs truncate block">{v || '—'}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex flex-wrap gap-2">
          {(row.status === 'Scheduled' || row.status === 'Confirmed') && (
            <>
              <button
                onClick={() => setRescheduleTarget(row)}
                className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Pencil size={12} /> Reschedule
              </button>
              <button
                onClick={() => setCancelTarget(row)}
                className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
              >
                <XCircle size={12} /> Cancel
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Book and manage appointments</p>
        </div>
        <button
          onClick={() => navigate('/receptionist/appointments/book')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <CalendarPlus size={16} /> Book Appointment
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Filter by status:</label>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s || 'All'}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Table columns={columns} data={appointments} isLoading={isLoading} emptyMessage="No appointments found." />
        <Pagination currentPage={page} dataLength={appointments.length} limit={PAGE_SIZE} onPageChange={setPage} />
      </div>

      {/* Cancel Confirm Modal */}
      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Appointment" size="sm">
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to cancel the appointment for{' '}
          <span className="font-semibold">{cancelTarget?.patient?.fullName ?? cancelTarget?.patientName}</span>?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setCancelTarget(null)}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Keep
          </button>
          <button
            onClick={handleCancel}
            disabled={actionLoading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {actionLoading ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <AppointmentReschedule
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={() => { setRescheduleTarget(null); fetchAppointments(); }}
        />
      )}
    </div>
  );
}
