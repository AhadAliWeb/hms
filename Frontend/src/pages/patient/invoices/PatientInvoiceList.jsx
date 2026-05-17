import { useState, useEffect, useCallback } from 'react';
import { Search, Receipt, Eye, Download, Loader2 } from 'lucide-react';
import axiosInstance from '../../../api/axiosInstance';
import Table from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import Badge from '../../../components/shared/Badge';
import Modal from '../../../components/shared/Modal';

const PAGE_SIZE = 10;
const STATUS_TABS = ['All', 'Paid', 'Unpaid'];

function statusVariant(status) {
  switch (status?.toLowerCase()) {
    case 'paid':   return 'success';
    case 'unpaid': return 'danger';
    default:       return 'default';
  }
}

const downloadPdf = async (id) => {
  const response = await axiosInstance.get(`/api/invoice/${id}/pdf`, {
    responseType: 'blob',
  });
  const url  = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', `Invoice_${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default function PatientInvoiceList() {
  const [data,          setData]          = useState([]);
  const [isLoading,     setIsLoading]     = useState(false);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [inputValue,    setInputValue]    = useState('');
  const [activeTab,     setActiveTab]     = useState('All');
  const [page,          setPage]          = useState(1);
  const [selected,      setSelected]      = useState(null);
  const [downloading,   setDownloading]   = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (search)               params.search = search;
      if (activeTab !== 'All')  params.status = activeTab;
      const res = await axiosInstance.get('/api/invoice/patient/my-invoices', { params });
      setData(res.data?.data ?? res.data ?? []);
    } catch {
      setError('Failed to load invoices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, activeTab]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputValue.trim());
  };

  const handleViewDetails = async (row) => {
    setDetailLoading(true);
    try {
      const res = await axiosInstance.get(`/api/invoice/${row.id}`);
      setSelected(res.data?.data ?? res.data ?? row);
    } catch {
      setSelected(row);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownload = async (id) => {
    setDownloading(id);
    try {
      await downloadPdf(id);
    } catch {
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const columns = [
    { key: 'doctorName',   label: 'Doctor' },
    { key: 'totalAmount',  label: 'Total',
      render: (v) => <span className="font-semibold text-gray-800">${Number(v ?? 0).toFixed(2)}</span> },
    { key: 'status',       label: 'Status',
      render: (v) => <Badge label={v ?? '—'} variant={statusVariant(v)} /> },
    { key: 'date',         label: 'Date',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    {
      key: '_actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleViewDetails(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Eye size={13} /> Details
          </button>
          <button
            onClick={() => handleDownload(row.id)}
            disabled={downloading === row.id}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            {downloading === row.id
              ? <Loader2 size={13} className="animate-spin" />
              : <Download size={13} />
            }
            PDF
          </button>
        </div>
      ),
    },
  ];

  const invoiceItems = selected
    ? (selected.items ?? selected.invoiceItems ?? [])
    : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          <Receipt size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Invoices</h1>
          <p className="text-sm text-gray-500">Billing and payment history</p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:max-w-xs">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search invoices…"
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

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Table
          columns={columns}
          data={data}
          isLoading={isLoading}
          emptyMessage="No invoices found."
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

      {/* Invoice Details Modal */}
      <Modal
        isOpen={!!selected || detailLoading}
        onClose={() => setSelected(null)}
        title="Invoice Details"
        size="lg"
      >
        {detailLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={28} className="animate-spin text-blue-500" />
          </div>
        ) : selected && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Doctor</p>
                <p className="text-sm font-medium text-gray-800">{selected.doctorName || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Date</p>
                <p className="text-sm font-medium text-gray-800">
                  {selected.date ? new Date(selected.date).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Status</p>
                <Badge label={selected.status} variant={statusVariant(selected.status)} />
              </div>
            </div>

            {/* Items Table */}
            {invoiceItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No items in this invoice.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Description', 'Qty', 'Unit Price', 'Total'].map((h) => (
                        <th key={h} className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2">{item.description ?? item.name ?? '—'}</td>
                        <td className="px-4 py-2">{item.quantity ?? '—'}</td>
                        <td className="px-4 py-2">${Number(item.unitPrice ?? item.price ?? 0).toFixed(2)}</td>
                        <td className="px-4 py-2 font-medium">${Number(item.total ?? item.amount ?? 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total Row */}
            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-lg px-5 py-3 text-right">
                <p className="text-xs text-gray-500 font-semibold uppercase">Total Amount</p>
                <p className="text-xl font-bold text-blue-700">
                  ${Number(selected.totalAmount ?? 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-end pt-1">
              <button
                onClick={() => handleDownload(selected.id)}
                disabled={downloading === selected.id}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {downloading === selected.id
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Download size={15} />
                }
                Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}