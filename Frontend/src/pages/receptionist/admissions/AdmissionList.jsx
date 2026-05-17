import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BedDouble, Search } from 'lucide-react';
import { getAll, search as searchAdmissions, discharge } from '../../../api/admissionApi';
import Table from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Badge from '../../../components/shared/Badge';
import Modal from '../../../components/shared/Modal';
import { useSelector } from 'react-redux';

const PAGE_SIZE = 10;

const statusVariant = (s) => {
  if (s === 'Admitted')   return 'info';
  if (s === 'Discharged') return 'default';
  return 'warning';
};

export default function AdmissionList() {
  const navigate                    = useNavigate();
  const [admissions, setAdmissions] = useState([]);
  const [page, setPage]             = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');
  const [dischargeTarget, setDischargeTarget] = useState(null);
  const [actionLoading, setActionLoading]     = useState(false);
  const { role } = useSelector((s) => s.auth);


  const fetchAdmissions = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      let res;
      if (searchTerm) {
        res = await searchAdmissions(searchTerm, page, PAGE_SIZE);
      } else {
        res = await getAll(page, PAGE_SIZE);
      }
      setAdmissions(res.data?.data ?? res.data ?? []);
    } catch {
      setError('Failed to load admissions.');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => { fetchAdmissions(); }, [fetchAdmissions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleDischarge = async () => {
    if (!dischargeTarget) return;
    setActionLoading(true);
    try {
      await discharge(dischargeTarget.id);
      setDischargeTarget(null);
      fetchAdmissions();
    } catch {
      setError('Failed to discharge patient.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'patientName',    label: 'Patient',
      render: (_, row) => row.patient?.fullName ?? row.patientName ?? '—' },
    { key: 'doctorName',     label: 'Doctor',
      render: (_, row) => row.doctor?.fullName ?? row.doctorName ?? '—' },
    { key: 'ward',           label: 'Ward',
      render: (_, row) => row.bed?.ward?.name ?? row.wardName ?? '—' },
    { key: 'bedNumber',      label: 'Bed',
      render: (_, row) => row.bed?.bedNumber ?? row.bedNumber ?? '—' },
    { key: 'status',         label: 'Status',
      render: (v) => <Badge label={v} variant={statusVariant(v)} /> },
    { key: 'admissionDate',  label: 'Admitted',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'dischargeDate',  label: 'Discharged',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    
    ...(role !== 'Nurse'
    ? [{
        key: 'actions',
        label: 'Actions',
        render: (_, row) =>
          row.status === 'Admitted' ? (
            <button
              onClick={() => setDischargeTarget(row)}
              className="rounded-lg bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
            >
              Discharge
            </button>
          ) : null,
      }]
    : []),
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage patient admissions & discharges</p>
        </div>
        {role !== 'Nurse' && (
          <button
          onClick={() => navigate('/receptionist/admissions/admit')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <BedDouble size={16} /> Admit Patient
        </button>)}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by patient name or bed…"
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button type="submit"
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
          Search
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Table columns={columns} data={admissions} isLoading={isLoading} emptyMessage="No admissions found." />
        <Pagination currentPage={page} dataLength={admissions.length} limit={PAGE_SIZE} onPageChange={setPage} />
      </div>

      {/* Discharge Confirm Modal */}
      <Modal isOpen={!!dischargeTarget} onClose={() => setDischargeTarget(null)} title="Discharge Patient" size="sm">
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to discharge{' '}
          <span className="font-semibold">
            {dischargeTarget?.patient?.fullName ?? dischargeTarget?.patientName}
          </span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDischargeTarget(null)}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={handleDischarge} disabled={actionLoading}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
            {actionLoading ? 'Discharging…' : 'Yes, Discharge'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
