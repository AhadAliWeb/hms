import { useEffect, useState } from 'react';
import Modal   from '../../../components/shared/Modal';
import Loader  from '../../../components/shared/Loader';
import Badge   from '../../../components/shared/Badge';
import { getById } from '../../../api/invoiceApi';

const fmt = (n) => `PKR ${Number(n ?? 0).toLocaleString()}`;

const statusVariant = (s) =>
  s?.toLowerCase() === 'paid' ? 'success' : 'danger';

export default function InvoiceDetail({ invoiceId, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const res = await getById(invoiceId);
        setInvoice(res.data);
      } catch {
        setError('Failed to load invoice details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [invoiceId]);

  return (
    <Modal isOpen={!!invoiceId} onClose={onClose} title="Invoice Details" size="lg">
      {loading ? (
        <div className="relative h-40"><Loader message="Loading invoice..." /></div>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : invoice ? (
        <div className="space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Patient</p>
              <p className="text-gray-800 font-medium">{invoice.patientName ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Doctor</p>
              <p className="text-gray-800 font-medium">{invoice.doctorName ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Date</p>
              <p className="text-gray-800">
                {invoice.createdAt
                  ? new Date(invoice.createdAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Status</p>
              <Badge
                label={invoice.status}
                variant={statusVariant(invoice.status)}
              />
            </div>
          </div>

          {/* Items table */}
          {invoice.items?.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Items</p>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="px-4 py-2 text-gray-700">{item.description ?? '—'}</td>
                        <td className="px-4 py-2 text-gray-500">{item.type ?? '—'}</td>
                        <td className="px-4 py-2 text-gray-800 font-medium text-right">{fmt(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(invoice.totalAmount)}</p>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
