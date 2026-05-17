import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { getAll, update } from '../../../api/medicineApi';
import Table from '../../../components/shared/Table';
import Badge from '../../../components/shared/Badge';
import Pagination from '../../../components/shared/Pagination';
import Modal from '../../../components/shared/Modal';

const PAGE_SIZE = 10;

export default function MedicineList() {
  const [medicines, setMedicines]   = useState([]);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');

  // Update stock modal
  const [stockModal, setStockModal]     = useState(false);
  const [selectedMed, setSelectedMed]   = useState(null);
  const [newQty, setNewQty]             = useState('');
  const [updating, setUpdating]         = useState(false);
  const [updateError, setUpdateError]   = useState('');

  const fetchMedicines = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await getAll(page, PAGE_SIZE, search || '');
      setMedicines(res.data?.data ?? res.data ?? []);
    } catch {
      setError('Failed to load medicines. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const openStockModal = (med) => {
    setSelectedMed(med);
    setNewQty(String(med.stockQuantity ?? ''));
    setUpdateError('');
    setStockModal(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedMed) return;
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 0) {
      setUpdateError('Please enter a valid quantity.');
      return;
    }
    setUpdating(true);
    setUpdateError('');
    try {
      await update(selectedMed.id, {
        name:              selectedMed.name,
        description:       selectedMed.description,
        unit:              selectedMed.unit,
        price:             selectedMed.price,
        stockQuantity:     qty,
        lowStockThreshold: selectedMed.lowStockThreshold,
      });
      setStockModal(false);
      fetchMedicines();
    } catch {
      setUpdateError('Failed to update stock. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { key: 'name',              label: 'Name' },
    { key: 'description',       label: 'Description' },
    { key: 'unit',              label: 'Unit' },
    {
      key: 'price',
      label: 'Price',
      render: (val) => val != null ? `$${Number(val).toFixed(2)}` : '—',
    },
    { key: 'stockQuantity',     label: 'Stock' },
    { key: 'lowStockThreshold', label: 'Threshold' },
    {
      key: 'stockStatus',
      label: 'Status',
      render: (_, row) => {
        const isLow = (row.stockQuantity ?? 0) <= (row.lowStockThreshold ?? 0);
        return isLow
          ? <Badge label="Low Stock" variant="danger" />
          : <Badge label="In Stock"  variant="success" />;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => openStockModal(row)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-medium"
        >
          <RefreshCw size={13} />
          Update Stock
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Medicine Inventory</h2>
        <p className="text-sm text-gray-500 mt-1">Manage and update medicine stock levels</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search medicines by name..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={medicines}
        isLoading={isLoading}
        emptyMessage="No medicines found."
      />

      <Pagination
        currentPage={page}
        dataLength={medicines.length}
        limit={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Update Stock Modal */}
      <Modal
        isOpen={stockModal}
        onClose={() => !updating && setStockModal(false)}
        title={`Update Stock — ${selectedMed?.name ?? ''}`}
        size="sm"
      >
        <div className="space-y-4">
          {/* Read-only info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Unit</p>
              <p className="text-gray-800">{selectedMed?.unit ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Price</p>
              <p className="text-gray-800">{selectedMed?.price != null ? `$${Number(selectedMed.price).toFixed(2)}` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Threshold</p>
              <p className="text-gray-800">{selectedMed?.lowStockThreshold ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Current Stock</p>
              <p className="text-gray-800 font-semibold">{selectedMed?.stockQuantity ?? '—'}</p>
            </div>
          </div>

          {/* Editable quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {updateError && (
              <p className="text-xs text-red-600 mt-1">{updateError}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => setStockModal(false)}
              disabled={updating}
              className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStock}
              disabled={updating}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}