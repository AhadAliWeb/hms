import { useState, useEffect, useCallback } from 'react';
import { Search, FlaskConical, Eye } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import Table from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Modal from '../../../components/shared/Modal';

const PAGE_SIZE = 10;

export default function PatientLabResultList() {
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
      const res = await axiosInstance.get('/api/labresult/patient/my-lab-results', { params });
      setData(res.data?.data ?? res.data ?? []);
    } catch {
      setError('Failed to load lab results. Please try again.');
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
    { key: 'labTestName',      label: 'Lab Test' },
    { key: 'technicianName',   label: 'Technician' },
    { key: 'result',           label: 'Result',
      render: (v) => <span className="font-medium text-gray-700">{v || '—'}</span> },
    { key: 'notes',            label: 'Notes',
      render: (v) => <span className="text-gray-500 line-clamp-1">{v || '—'}</span> },
    { key: 'date',             label: 'Date',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    {
      key: '_actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => setSelected(row)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <Eye size={13} /> View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <FlaskConical size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Lab Results</h1>
          <p className="text-sm text-gray-500">Laboratory test results from your visits</p>
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
              placeholder="Search lab results…"
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
          emptyMessage="No lab results found."
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

      {/* Details Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Lab Result Details"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            <DetailRow label="Lab Test"   value={selected.labTestName} />
            <DetailRow label="Technician" value={selected.technicianName} />
            <DetailRow label="Date"       value={selected.date ? new Date(selected.date).toLocaleDateString() : '—'} />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Result</p>
              <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-gray-800 font-medium">
                {selected.result || '—'}
              </div>
            </div>
            {selected.notes && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
                <p className="text-sm text-gray-700">{selected.notes}</p>
              </div>
            )}
            {selected.referenceRange && (
              <DetailRow label="Reference Range" value={selected.referenceRange} />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <span className="text-xs font-semibold text-gray-500 uppercase w-36 shrink-0 mb-0.5 sm:mb-0">
        {label}
      </span>
      <p className="text-sm text-gray-800">{value || '—'}</p>
    </div>
  );
}