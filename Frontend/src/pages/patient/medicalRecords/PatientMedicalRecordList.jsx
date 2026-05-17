import { useState, useEffect, useCallback } from 'react';
import { Search, FileText, Eye } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import Table from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Modal from '../../../components/shared/Modal';

const PAGE_SIZE = 10;

export default function PatientMedicalRecordList() {
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
      const res = await axiosInstance.get('/api/medicalrecord/patient/my-records', { params });
      setData(res.data?.data ?? res.data ?? []);
    } catch {
      setError('Failed to load medical records. Please try again.');
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
    { key: 'doctorName',   label: 'Doctor' },
    { key: 'diagnosis',    label: 'Diagnosis' },
    { key: 'prescription', label: 'Prescription',
      render: (v) => <span className="text-gray-500 line-clamp-1">{v || '—'}</span> },
    { key: 'notes',        label: 'Notes',
      render: (v) => <span className="text-gray-500 line-clamp-1">{v || '—'}</span> },
    { key: 'recordDate',         label: 'Date',
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
          <FileText size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Medical Records</h1>
          <p className="text-sm text-gray-500">Your full clinical history</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-xs">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search records…"
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
          emptyMessage="No medical records found."
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
        title="Medical Record Details"
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            <DetailRow label="Doctor"       value={selected.doctorName} />
            <DetailRow label="Date"         value={selected.recordDate ? new Date(selected.recordDate).toLocaleDateString() : '—'} />
            <DetailRow label="Diagnosis"    value={selected.diagnosis} />
            <DetailRow label="Prescription" value={selected.prescription} />
            <DetailRow label="Notes"        value={selected.notes} />
            {selected.vitalSigns && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Vital Signs</p>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {typeof selected.vitalSigns === 'object'
                    ? JSON.stringify(selected.vitalSigns, null, 2)
                    : selected.vitalSigns}
                </div>
              </div>
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