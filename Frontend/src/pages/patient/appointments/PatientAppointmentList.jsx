import { useState, useEffect, useCallback } from 'react';
import { Search, CalendarDays } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import Table from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Badge from '../../../components/shared/Badge';

const STATUS_TABS = ['All', 'Pending', 'Completed', 'Cancelled'];

const PAGE_SIZE = 10;

function statusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    case 'pending':   return 'warning';
    default:          return 'default';
  }
}

const columns = [
  { key: 'doctorName',      label: 'Doctor' },
  // { key: 'specialization',  label: 'Specialization' },
  { key: 'appointmentDate',            label: 'Date',
    render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  { key: 'status',          label: 'Status',
    render: (v) => <Badge label={v ?? '—'} variant={statusVariant(v)} /> },
  { key: 'notes',           label: 'Notes',
    render: (v) => <span className="text-gray-500">{v || '—'}</span> },
];

export default function PatientAppointmentList() {
  const [data,        setData]        = useState([]);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [inputValue,  setInputValue]  = useState('');
  const [activeTab,   setActiveTab]   = useState('All');
  const [page,        setPage]        = useState(1);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (search)               params.search = search;
      if (activeTab !== 'All')  params.status = activeTab;
      const res = await axiosInstance.get('/api/appointment/patient/my-appointments', { params });
      setData(res.data);
    } catch {
      setError('Failed to load appointments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputValue.trim());
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <CalendarDays size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-sm text-gray-500">View all your scheduled appointments</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-xs">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search appointments…"
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

          {/* Status Tabs */}
          <div className="flex gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          data={data}
          isLoading={isLoading}
          emptyMessage="No appointments found."
        />

        {/* Pagination */}
        {!isLoading && (
          <Pagination
            currentPage={page}
            dataLength={data.length}
            limit={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}