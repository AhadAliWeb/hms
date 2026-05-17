import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Table      from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Modal      from '../../../components/shared/Modal';
import Badge      from '../../../components/shared/Badge';
import { getAllByWard, create, update, remove } from '../../../api/bedApi';

const EMPTY_FORM = { bedNumber: '', status: 'Available' };

export default function BedList() {
  const { wardId } = useParams();
  const navigate   = useNavigate();
  const [beds, setBeds]         = useState([]);
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
    try {
      const res = await getAllByWard(wardId, p, 10);
      const all = res.data;
      // const filtered = wardId ? all.filter((b) => String(b.wardId) === String(wardId)) : all;
      setBeds(all);
      setTotal(res.data.totalPages || 1);
    } catch { setError('Failed to load beds.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(page); }, [page, wardId]);

  const openCreate = () => { setET(null); setForm({ ...EMPTY_FORM, wardId }); setFormModal(true); };
  const openEdit   = (row) => { setET(row); setForm({ bedNumber: row.bedNumber, status: row.status, wardId: row.wardId }); setFormModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) await update(editTarget.id, form);
      else await create(form);
      setFormModal(false);
      fetch(page);
    } catch { setError('Failed to save bed.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await remove(deleteTarget.id); setDT(null); fetch(page); }
    catch { setError('Failed to delete bed.'); }
    finally { setDeleting(false); }
  };

  const statusVariant = (s) => ({ Available: 'success', Occupied: 'warning', Maintenance: 'danger' }[s] || 'default');

  const columns = [
    { key: 'bedNumber', label: 'Bed Number' },
    { key: 'wardName',  label: 'Ward' },
    { key: 'isOccupied',    label: 'Status', render: (v) => <Badge label={v.isOccupied ? 'Occupied' : 'Available'} variant={statusVariant(v.isOccupied ? 'Occupied' : 'Available')} /> },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={15}/></button>
          <button onClick={() => setDT(row)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15}/></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/wards')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ArrowLeft size={18}/></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Beds</h1>
            <p className="text-sm text-gray-500 mt-0.5">{wardId ? `Beds for Ward #${wardId}` : 'All beds'}</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16}/> Add Bed
        </button>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <Table columns={columns} data={beds} isLoading={loading} emptyMessage="No beds found." />
      <Pagination currentPage={page} dataLength={beds.length} limit={10} onPageChange={setPage} />

      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title={editTarget ? 'Edit Bed' : 'Add Bed'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Bed Number *</label>
            <input required value={form.bedNumber} onChange={(e) => setForm({...form, bedNumber: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['Available','Occupied','Maintenance'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setFormModal(false)} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium disabled:opacity-60">
              {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDT(null)} title="Delete Bed" size="sm">
        <p className="text-sm text-gray-600 mb-6">Delete bed <strong>{deleteTarget?.bedNumber}</strong>?</p>
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
