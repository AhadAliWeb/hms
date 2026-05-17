import { useEffect, useState, useCallback } from 'react';
import { Eye } from 'lucide-react';
import Table from '../../components/shared/Table';
import Badge from '../../components/shared/Badge';
import Modal from '../../components/shared/Modal';
import Loader from '../../components/shared/Loader';
import Pagination from '../../components/shared/Pagination';
import { getAll as getWards } from '../../api/wardApi';
import { getByWard } from '../../api/admissionApi';

/* ─── helpers ─────────────────────────────────────── */
const PAGE_SIZE = 10;

function statusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'admitted':   return 'info';
    case 'discharged': return 'default';
    default:           return 'default';
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ─── Detail row helper ───────────────────────────── */
function DetailRow({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:gap-4">
      <span className="w-36 shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="text-sm text-gray-800">{children}</span>
    </div>
  );
}

/* ─── Main component ──────────────────────────────── */
export default function WardPatients() {
  /* Wards */
  const [wards, setWards]           = useState([]);
  const [wardsLoading, setWardsLoading] = useState(true);
  const [wardsError, setWardsError]  = useState('');

  /* Selected ward */
  const [selectedWardId, setSelectedWardId] = useState('');

  /* Patients */
  const [patients, setPatients]     = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState('');
  const [page, setPage]             = useState(1);

  /* Modal */
  const [selected, setSelected]     = useState(null);

  /* ── Fetch wards on mount ─────────────────────── */
  useEffect(() => {
    const fetch_ = async () => {
      try {
        setWardsLoading(true);
        const res = await getWards(1, 100);
        const list = res.data?.data ?? res.data ?? [];
        setWards(list);
        if (list.length > 0) setSelectedWardId(String(list[0].id));
      } catch {
        setWardsError('Failed to load wards.');
      } finally {
        setWardsLoading(false);
      }
    };
    fetch_();
  }, []);

  /* ── Fetch patients when ward / page changes ──── */
  const fetchPatients = useCallback(async (wardId, pg) => {
    if (!wardId) return;
    try {
      setPatientsLoading(true);
      setPatientsError('');
      const res = await getByWard(wardId, pg, PAGE_SIZE);
      const list = res.data?.data ?? res.data ?? [];
      setPatients(Array.isArray(list) ? list : []);
    } catch {
      setPatientsError('Failed to load patients for the selected ward.');
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedWardId) {
      setPage(1);
      fetchPatients(selectedWardId, 1);
    }
  }, [selectedWardId, fetchPatients]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchPatients(selectedWardId, newPage);
  };

  /* ── Table columns ───────────────────────────── */
  const columns = [
    { key: 'patientName', label: 'Patient Name' },
    { key: 'doctorName',  label: 'Doctor Name' },
    { key: 'wardName',    label: 'Ward Name' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge label={val} variant={statusVariant(val)} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => setSelected(row)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100"
        >
          <Eye size={13} />
          Details
        </button>
      ),
    },
  ];

  /* ── Render ──────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ward Patients</h2>
        <p className="mt-1 text-sm text-gray-500">
          View admitted patients by ward
        </p>
      </div>

      {/* Ward selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        {wardsLoading ? (
          <div className="relative h-12">
            <Loader message="Loading wards..." />
          </div>
        ) : wardsError ? (
          <p className="text-sm text-red-600">{wardsError}</p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label
              htmlFor="ward-select"
              className="text-sm font-medium text-gray-700 shrink-0"
            >
              Select Ward
            </label>
            <select
              id="ward-select"
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 sm:w-64"
            >
              {wards.map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Patients table */}
      {!wardsLoading && !wardsError && (
        <div className="space-y-3">
          {patientsError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {patientsError}
            </div>
          )}

          <Table
            columns={columns}
            data={patients}
            isLoading={patientsLoading}
            emptyMessage="No patients found for this ward."
          />

          <Pagination
            currentPage={page}
            dataLength={patients.length}
            limit={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Detail modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Patient Details"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <DetailRow label="Patient Name">{selected.patientName}</DetailRow>
            <DetailRow label="Doctor Name">{selected.doctorName}</DetailRow>
            <DetailRow label="Ward Name">{selected.wardName}</DetailRow>
            <DetailRow label="Bed Number">{selected.bedNumber ?? '—'}</DetailRow>
            <DetailRow label="Admission Date">{formatDate(selected.admissionDate)}</DetailRow>
            <DetailRow label="Discharge Date">{formatDate(selected.dischargeDate)}</DetailRow>
            <DetailRow label="Status">
              <Badge label={selected.status} variant={statusVariant(selected.status)} />
            </DetailRow>
            <DetailRow label="Notes">{selected.notes ?? '—'}</DetailRow>
          </div>
        )}
      </Modal>
    </div>
  );
}
