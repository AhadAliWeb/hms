import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Table      from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Modal      from '../../../components/shared/Modal';
import Badge      from '../../../components/shared/Badge';
import { getAll, create, update, remove } from '../../../api/medicineApi';

const EMPTY_FORM = { name: '', description: '', unit: '', price: '', stockQuantity: '', lowStockThreshold: '' };

export default function MedicineList() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [page, setPage]           = useState(1);
  const [totalPages, setTotal]    = useState(1);
  const [deleteTarget, setDT]     = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [editTarget, setET]       = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  const fetch = async (p = page) => {
    setLoading(true);
    try {
      const res = await getAll(p, 10);
      setMedicines(res.data.data || res.data.items || res.data || []);
      setTotal(res.data.totalPages || 1);
    } catch { setError('Failed to load medicines.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(page); }, [page]);

  const openCreate = () => { setET(null); setForm(EMPTY_FORM); setFormModal(true); };
  const openEdit   = (row) => {
    setET(row);
    setForm({ name: row.name, description: row.description, unit: row.unit, price: row.price, stockQuantity: row.stockQuantity, lowStockThreshold: row.lowStockThreshold });
    setFormModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) await update(editTarget.id, form);
      else await create(form);
      setFormModal(false); fetch(page);
    } catch { setError('Failed to save medicine.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await remove(deleteTarget.id); setDT(null); fetch(page); }
    catch { setError('Failed to delete medicine.'); }
    finally { setDeleting(false); }
  };

  const isLow = (row) => row.stockQuantity <= row.lowStockThreshold;

  const columns = [
    { key: 'name',              label: 'Name' },
    { key: 'description',       label: 'Description' },
    { key: 'unit',              label: 'Unit' },
    { key: 'price',             label: 'Price', render: (v) => v != null ? `$${v}` : '—' },
    { key: 'stockQuantity',     label: 'Stock' },
    { key: 'lowStockThreshold', label: 'Low Stock Threshold' },
    {
      key: 'stockStatus', label: 'Status',
      render: (_, row) => isLow(row) ? <Badge label="Low Stock" variant="danger" /> : <Badge label="In Stock" variant="success" />,
    },
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage medicine inventory</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16}/> Add Medicine
        </button>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <Table columns={columns} data={medicines} isLoading={loading} emptyMessage="No medicines found." />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title={editTarget ? 'Edit Medicine' : 'Add Medicine'}>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          {[
            { name: 'name', label: 'Name', span: true },
            { name: 'description', label: 'Description', span: true },
            { name: 'unit', label: 'Unit' },
            { name: 'price', label: 'Price', type: 'number' },
            { name: 'stockQuantity', label: 'Stock Quantity', type: 'number' },
            { name: 'lowStockThreshold', label: 'Low Stock Threshold', type: 'number' },
          ].map((f) => (
            <div key={f.name} className={f.span ? 'col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">{f.label}</label>
              <input
                type={f.type || 'text'}
                value={form[f.name] ?? ''}
                onChange={(e) => setForm({...form, [f.name]: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div className="col-span-2 flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setFormModal(false)} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium disabled:opacity-60">
              {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDT(null)} title="Delete Medicine" size="sm">
        <p className="text-sm text-gray-600 mb-6">Delete <strong>{deleteTarget?.name}</strong>?</p>
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
