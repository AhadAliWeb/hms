import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, CheckCircle } from 'lucide-react';
import { getAllPrescriptions, dispensePrescription } from '../../../api/prescriptionApi';
import Table from '../../../components/shared/Table';
import Badge from '../../../components/shared/Badge';
import Pagination from '../../../components/shared/Pagination';
import Modal from '../../../components/shared/Modal';
import Loader from '../../../components/shared/Loader';

const PAGE_SIZE = 10;

const statusBadge = (status) => {
  const map = {
    Pending:   'warning',
    Dispensed: 'success',
  };
  return <Badge label={status} variant={map[status] || 'default'} />;
};

export default function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('');
  const [page, setPage]           = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  // View items modal
  const [viewModal, setViewModal]   = useState(false);
  const [selected, setSelected]     = useState(null);

  // Dispense confirm modal
  const [dispenseModal, setDispenseModal]     = useState(false);
  const [dispensing, setDispensing]           = useState(false);
  const [dispenseTarget, setDispenseTarget]   = useState(null);

  const fetchPrescriptions = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await getAllPrescriptions(page, PAGE_SIZE, search || undefined, status || undefined);
      setPrescriptions(res.data?.data ?? res.data ?? []);
    } catch {
      setError('Failed to load prescriptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const openViewModal = (row) => {
    setSelected(row);
    setViewModal(true);
  };

  const openDispenseModal = (row) => {
    setDispenseTarget(row);
    setDispenseModal(true);
  };

  const handleDispense = async () => {
    if (!dispenseTarget) return;
    setDispensing(true);
    try {
      await dispensePrescription(dispenseTarget.id);
      setDispenseModal(false);
      setDispenseTarget(null);
      fetchPrescriptions();
    } catch {
      setError('Failed to dispense prescription. Please try again.');
      setDispenseModal(false);
    } finally {
      setDispensing(false);
    }
  };

  const columns = [
    { key: 'patientName',  label: 'Patient' },
    { key: 'doctorName',   label: 'Doctor' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => statusBadge(val),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'items',
      label: 'Items',
      render: (val) => val?.length ?? '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => openViewModal(row)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium"
          >
            <Eye size={13} />
            View Items
          </button>
          {row.status === 'Pending' && (
            <button
              onClick={() => openDispenseModal(row)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors font-medium"
            >
              <CheckCircle size={13} />
              Dispense
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Prescriptions</h2>
        <p className="text-sm text-gray-500 mt-1">View and dispense patient prescriptions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient or doctor..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={handleStatusChange}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Dispensed">Dispensed</option>
        </select>
      </div>

      {/* Table */}
      <div className="relative">
        {isLoading && <Loader message="Loading prescriptions..." />}
        <Table
          columns={columns}
          data={prescriptions}
          isLoading={isLoading}
          emptyMessage="No prescriptions found."
        />
      </div>

      <Pagination
        currentPage={page}
        dataLength={prescriptions.length}
        limit={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* View Items Modal */}
      <Modal
        isOpen={viewModal}
        onClose={() => setViewModal(false)}
        title="Prescription Items"
        size="lg"
      >
        {selected?.items?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500">
                  <th className="px-3 py-2 text-left">Medicine</th>
                  <th className="px-3 py-2 text-left">Dosage</th>
                  <th className="px-3 py-2 text-left">Frequency</th>
                  <th className="px-3 py-2 text-left">Duration</th>
                  <th className="px-3 py-2 text-left">Qty</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-800 font-medium">{item.medicineName ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{item.dosage ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{item.frequency ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{item.durationDays ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-600">{item.quantity ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">No items in this prescription.</p>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setViewModal(false)}
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Dispense Confirm Modal */}
      <Modal
        isOpen={dispenseModal}
        onClose={() => !dispensing && setDispenseModal(false)}
        title="Confirm Dispense"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to dispense this prescription for{' '}
          <span className="font-semibold text-gray-800">{dispenseTarget?.patientName}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDispenseModal(false)}
            disabled={dispensing}
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDispense}
            disabled={dispensing}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium disabled:opacity-50"
          >
            {dispensing ? 'Dispensing...' : 'Confirm Dispense'}
          </button>
        </div>
      </Modal>
    </div>
  );
}