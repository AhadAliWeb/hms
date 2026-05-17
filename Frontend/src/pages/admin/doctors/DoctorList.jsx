import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table      from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Modal      from '../../../components/shared/Modal';
import { getAll, remove } from '../../../api/doctorApi';

export default function DoctorList() {
  const navigate = useNavigate();
  const [doctors, setDoctors]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotal]  = useState(1);
  const [deleteTarget, setDT]   = useState(null);
  const [deleting, setDeleting] = useState(false);

  const PAGE_SIZE = 10;

  const fetchDoctors = async (p = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAll(p, PAGE_SIZE);
      setDoctors(res.data.data || res.data.items || res.data || []);
      setTotal(res.data.totalPages || Math.ceil((res.data.totalCount || 0) / PAGE_SIZE) || 1);
    } catch {
      setError('Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(page); }, [page]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      setDT(null);
      fetchDoctors(page);
    } catch {
      setError('Failed to delete doctor.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'fullName',         label: 'Full Name' },
    { key: 'email',            label: 'Email' },
    { key: 'specialization',   label: 'Specialization' },
    { key: 'qualification',    label: 'Qualification' },
    { key: 'experienceYears',  label: 'Exp (yrs)' },
    { key: 'consultationFee',  label: 'Fee', render: (v) => v != null ? `$${v}` : '—' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/doctors/${row.id}/edit`)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => setDT(row)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage hospital doctors</p>
        </div>
        <button
          onClick={() => navigate('/admin/doctors/create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <Table columns={columns} data={doctors} isLoading={loading} emptyMessage="No doctors found." />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDT(null)} title="Delete Doctor" size="sm">
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>{deleteTarget?.fullName}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDT(null)} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium disabled:opacity-60">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
