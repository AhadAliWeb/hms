import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BedDouble } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Table      from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Modal      from '../../../components/shared/Modal';
import { getAll, create, update, remove } from '../../../api/wardApi';

const WARD_TYPES = ['General', 'ICU', 'Emergency', 'Maternity', 'Pediatric', 'Surgical', 'Orthopedic', 'Oncology'];

const EMPTY_FORM = { name: '', type: '', totalBeds: '' };

export default function WardList() {
  const navigate = useNavigate();
  const [wards, setWards]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotal]  = useState(1);
  const [deleteTarget, setDT]   = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setET]     = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const fetch = async (p = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAll(p, 10);
      setWards(res.data.data || res.data.items || res.data || []);
      setTotal(res.data.totalPages || 1);
    } catch { setError('Failed to load wards.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(page); }, [page]);

  const openCreate = () => { setET(null); setForm(EMPTY_FORM); setFormModal(true); };
  const openEdit   = (row) => { setET(row); setForm({ name: row.name, type: row.type, totalBeds: row.totalBeds }); setFormModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) await update(editTarget.id, form);
      else await create(form);
      setFormModal(false);
      fetch(page);
    } catch { setError('Failed to save ward.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await remove(deleteTarget.id); setDT(null); fetch(page); }
    catch { setError('Failed to delete ward.'); }
    finally { setDeleting(false); }
  };

  const columns = [
    { key: 'name',          label: 'Ward Name' },
    { key: 'type',          label: 'Type' },
    { key: 'totalBeds',     label: 'Total Beds' },
    { key: 'availableBeds', label: 'Available Beds' },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/admin/wards/${row.id}/beds`)} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg" title="View Beds"><BedDouble size={15}/></button>
          <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={15}/></button>
          <button onClick={() => setDT(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wards</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage hospital wards</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16}/> Add Ward
        </button>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <Table columns={columns} data={wards} isLoading={loading} emptyMessage="No wards found." />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create / Edit Modal */}
      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title={editTarget ? 'Edit Ward' : 'Add Ward'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Ward Name *</label>
            <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select…</option>
              {WARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Beds</label>
            <input type="number" value={form.totalBeds} onChange={(e) => setForm({...form, totalBeds: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setFormModal(false)} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium disabled:opacity-60">
              {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDT(null)} title="Delete Ward" size="sm">
        <p className="text-sm text-gray-600 mb-6">Delete ward <strong>{deleteTarget?.name}</strong>?</p>
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
