import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Pencil } from 'lucide-react';
import { getAll } from '../../../api/patientApi';
import Table from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';

const PAGE_SIZE = 10;

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients]   = useState([]);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getAll(page, PAGE_SIZE, search);
      setPatients(res.data?.data ?? res.data ?? []);
    } catch {
      setError('Failed to load patients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const columns = [
    { key: 'fullName',         label: 'Full Name' },
    { key: 'email',            label: 'Email' },
    { key: 'bloodGroup',       label: 'Blood Group' },
    { key: 'dateOfBirth',      label: 'Date of Birth',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'emergencyContact', label: 'Emergency Contact' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/receptionist/patients/${row.id}/edit`)}
          className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Pencil size={14} /> Edit
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage registered patients</p>
        </div>
        <button
          onClick={() => navigate('/receptionist/patients/register')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={16} /> Register Patient
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Table columns={columns} data={patients} isLoading={isLoading} emptyMessage="No patients found." />
        <Pagination
          currentPage={page}
          dataLength={patients.length}
          limit={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
