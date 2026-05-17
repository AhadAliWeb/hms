import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Search, Download, Eye, CheckCircle } from 'lucide-react';
import Table      from '../../../components/shared/Table';
import Badge      from '../../../components/shared/Badge';
import Modal      from '../../../components/shared/Modal';
import Pagination from '../../../components/shared/Pagination';
import Spinner    from '../../../components/shared/Spinner';
import InvoiceDetail from './InvoiceDetail';
import InvoiceCreate from './InvoiceCreate';
import { getAll, markAsPaid, downloadPdf } from '../../../api/invoiceApi';

const PAGE_SIZE = 10;

const statusVariant = (s) =>
  s?.toLowerCase() === 'paid' ? 'success' : 'danger';

export default function InvoiceList() {
  const [invoices, setInvoices]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState('');
  const [status, setStatus]             = useState('');
  const [searchInput, setSearchInput]   = useState('');

  const [detailId, setDetailId]         = useState(null);
  const [showCreate, setShowCreate]     = useState(false);

  const [payTarget, setPayTarget]       = useState(null);   // invoice to mark paid
  const [paying, setPaying]             = useState(false);
  const [payError, setPayError]         = useState('');

  const [downloading, setDownloading]   = useState(null);   // id being downloaded

  const searchTimer = useRef(null);

  const fetchInvoices = useCallback(async (pg, srch, st) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAll(pg, PAGE_SIZE, srch, st);
      const list = res.data?.data ?? res.data ?? [];
      setInvoices(Array.isArray(list) ? list : []);
    } catch {
      setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices(page, search, status);
  }, [page, search, status, fetchInvoices]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 400);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleMarkPaid = async () => {
    if (!payTarget) return;
    setPaying(true);
    setPayError('');
    try {
      await markAsPaid(payTarget.id);
      setPayTarget(null);
      fetchInvoices(page, search, status);
    } catch (err) {
      setPayError(err?.response?.data?.message ?? 'Failed to mark as paid.');
    } finally {
      setPaying(false);
    }
  };

  const handleDownload = async (id) => {
    setDownloading(id);
    try {
      await downloadPdf(id);
    } catch {
      // silent — browser already handles the blob
    } finally {
      setDownloading(null);
    }
  };

  const fmt = (n) => `PKR ${Number(n ?? 0).toLocaleString()}`;

  const columns = [
    { key: 'patientName', label: 'Patient' },
    { key: 'doctorName',  label: 'Doctor' },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (v) => <span className="font-medium">{fmt(v)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge label={v} variant={statusVariant(v)} />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (v) => v ? new Date(v).toLocaleDateString() : '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex flex-wrap items-center gap-2">
          {/* View */}
          <button
            onClick={() => setDetailId(row.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Eye size={13} />
            <span className="hidden sm:inline">View</span>
          </button>

          {/* Mark Paid */}
          {row.status?.toLowerCase() !== 'paid' && (
            <button
              onClick={() => setPayTarget(row)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
            >
              <CheckCircle size={13} />
              <span className="hidden sm:inline">Mark Paid</span>
            </button>
          )}

          {/* Download PDF */}
          <button
            onClick={() => handleDownload(row.id)}
            disabled={downloading === row.id}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {downloading === row.id
              ? <Spinner size="sm" />
              : <Download size={13} />}
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track patient invoices</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          Generate Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by patient or invoice..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={handleStatusChange}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[130px]"
        >
          <option value="">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        data={invoices}
        isLoading={loading}
        emptyMessage="No invoices found."
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        dataLength={invoices.length}
        limit={PAGE_SIZE}
        onPageChange={setPage}
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetail invoiceId={detailId} onClose={() => setDetailId(null)} />

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Generate Invoice"
        size="md"
      >
        <InvoiceCreate
          onClose={() => setShowCreate(false)}
          onCreated={() => fetchInvoices(page, search, status)}
        />
      </Modal>

      {/* Confirm Mark as Paid Modal */}
      <Modal
        isOpen={!!payTarget}
        onClose={() => { setPayTarget(null); setPayError(''); }}
        title="Mark Invoice as Paid"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to mark invoice for{' '}
            <span className="font-medium text-gray-800">{payTarget?.patientName}</span>{' '}
            as <span className="font-medium text-green-600">Paid</span>?
          </p>
          {payError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{payError}</p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setPayTarget(null); setPayError(''); }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkPaid}
              disabled={paying}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {paying && <Spinner size="sm" color="text-white" />}
              Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
