import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table      from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Modal      from '../../../components/shared/Modal';
import { getAll, remove } from '../../../api/patientApi';

export default function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotal]  = useState(1);
  const [deleteTarget, setDT]   = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = async (p = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAll(p, 10);
      setPatients(res.data.data || res.data.items || res.data || []);
      setTotal(res.data.totalPages || Math.ceil((res.data.totalCount || 0) / 10) || 1);
    } catch { setError('Failed to load patients.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(page); }, [page]);

  const handleDelete = async () => {
    setDeleting(true);
    try { await remove(deleteTarget.id); setDT(null); fetch(page); }
    catch { setError('Failed to delete patient.'); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'fullName',        label: 'Full Name' },
    { key: 'email',           label: 'Email' },
    { key: 'bloodGroup',      label: 'Blood Group' },
    { key: 'address',         label: 'Address' },
    { key: 'dateOfBirth',     label: 'Date of Birth', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'emergencyContact',label: 'Emergency Contact' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/admin/patients/${row.id}/edit`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={15}/></button>
          <button onClick={() => setDT(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage registered patients</p>
        </div>
        <button onClick={() => navigate('/admin/patients/create')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16}/> Add Patient
        </button>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <Table columns={columns} data={patients} isLoading={loading} emptyMessage="No patients found." />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={!!deleteTarget} onClose={() => setDT(null)} title="Delete Patient" size="sm">
        <p className="text-sm text-gray-600 mb-6">Delete <strong>{deleteTarget?.fullName}</strong>? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDT(null)} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 font-medium">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white font-medium disabled:opacity-60">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
