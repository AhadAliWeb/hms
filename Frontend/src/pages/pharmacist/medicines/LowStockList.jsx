import { useState, useEffect, useCallback } from 'react';
import { Search, AlertTriangle, RefreshCw } from 'lucide-react';
import { getLowStock, update } from '../../../api/medicineApi';
import Table from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Modal from '../../../components/shared/Modal';

const PAGE_SIZE = 10;

export default function LowStockList() {
  const [medicines, setMedicines]   = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');

  // Update stock modal
  const [stockModal, setStockModal]   = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [newQty, setNewQty]           = useState('');
  const [updating, setUpdating]       = useState(false);
  const [updateError, setUpdateError] = useState('');

  const fetchLowStock = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (search) params.search = search;
      const res = await getLowStock(page, PAGE_SIZE, search || undefined);
      const data = res.data;
      if (Array.isArray(data)) {
        setMedicines(data);
        setTotalCount(data.length);
      } else {
        setMedicines(data?.data ?? []);
        setTotalCount(data?.total ?? data?.data?.length ?? 0);
      }
    } catch {
      setError('Failed to load low stock medicines. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

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
      fetchLowStock();
    } catch {
      setUpdateError('Failed to update stock. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { key: 'name',              label: 'Name' },
    { key: 'unit',              label: 'Unit' },
    {
      key: 'stockQuantity',
      label: 'Current Stock',
      render: (val, row) => (
        <span className={`font-semibold ${val <= (row.lowStockThreshold ?? 0) ? 'text-red-600' : 'text-gray-800'}`}>
          {val ?? '—'}
        </span>
      ),
    },
    { key: 'lowStockThreshold', label: 'Threshold' },
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
        <h2 className="text-2xl font-bold text-gray-900">Low Stock Alerts</h2>
        <p className="text-sm text-gray-500 mt-1">Medicines that need to be restocked</p>
      </div>

      {/* Alert Banner */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-red-600 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {totalCount} medicine{totalCount !== 1 ? 's are' : ' is'} running low on stock.
          </p>
        </div>
      )}

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
            placeholder="Search low stock medicines..."
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
        emptyMessage="No low stock medicines found. All medicines are well stocked!"
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
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Unit</p>
              <p className="text-gray-800">{selectedMed?.unit ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Threshold</p>
              <p className="text-gray-800">{selectedMed?.lowStockThreshold ?? '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Current Stock</p>
              <p className="text-red-600 font-bold text-lg">{selectedMed?.stockQuantity ?? '—'}</p>
            </div>
          </div>

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