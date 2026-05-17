import { useState, useEffect, useCallback } from 'react';
import { Search, ClipboardList, Eye } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import Table from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Badge from '../../../components/shared/Badge';
import Modal from '../../../components/shared/Modal';

const PAGE_SIZE = 10;

function statusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'dispensed': return 'success';
    case 'pending':   return 'warning';
    case 'cancelled': return 'danger';
    default:          return 'default';
  }
}

export default function PrescriptionList() {
  const [data,       setData]       = useState([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [inputValue, setInputValue] = useState('');
  const [page,       setPage]       = useState(1);
  const [selected,   setSelected]   = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (search) params.search = search;
      const res = await axiosInstance.get('/api/prescription/patient/my-prescriptions', { params });
      setData(res.data?.data ?? res.data ?? []);
    } catch {
      setError('Failed to load prescriptions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputValue.trim());
  };

  const columns = [
    { key: 'doctorName', label: 'Doctor' },
    { key: 'status',     label: 'Status',
      render: (v) => <Badge label={v ?? '—'} variant={statusVariant(v)} /> },
    { key: 'createdAt',       label: 'Date',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'items',      label: 'Items',
      render: (v, row) => {
        const count = Array.isArray(v) ? v.length
          : Array.isArray(row.prescriptionItems) ? row.prescriptionItems.length
          : '—';
        return <span className="font-medium text-gray-700">{count}</span>;
      },
    },
    {
      key: '_actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => setSelected(row)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <Eye size={13} /> View Items
        </button>
      ),
    },
  ];

  const items = selected
    ? (selected.items ?? selected.prescriptionItems ?? [])
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <ClipboardList size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Prescriptions</h1>
          <p className="text-sm text-gray-500">All prescriptions issued by your doctors</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-xs">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search prescriptions…"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Table
          columns={columns}
          data={data}
          isLoading={isLoading}
          emptyMessage="No prescriptions found."
        />

        {!isLoading && (
          <Pagination
            currentPage={page}
            dataLength={data.length}
            limit={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Items Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Prescription Items"
        size="lg"
      >
        {selected && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <span><strong>Doctor:</strong> {selected.doctorName || '—'}</span>
              <span><strong>Date:</strong> {selected.date ? new Date(selected.date).toLocaleDateString() : '—'}</span>
              <span>
                <strong>Status:</strong>{' '}
                <Badge label={selected.status} variant={statusVariant(selected.status)} />
              </span>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No items found.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Medicine', 'Dosage', 'Frequency', 'Duration', 'Quantity'].map((h) => (
                        <th key={h} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2">{item.medicineName ?? item.medicine ?? '—'}</td>
                        <td className="px-4 py-2">{item.dosage ?? '—'}</td>
                        <td className="px-4 py-2">{item.frequency ?? '—'}</td>
                        <td className="px-4 py-2">{item.durationDays ?? '—'}</td>
                        <td className="px-4 py-2">{item.quantity ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}