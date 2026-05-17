import { useEffect, useState } from 'react';
import Table      from '../../../components/shared/Table';
import Pagination from '../../../components/shared/Pagination';
import { getAll } from '../../../api/auditLogApi';

export default function AuditLogList() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [page, setPage]       = useState(1);
  const [totalPages, setTotal]= useState(1);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getAll(page, 20);
        setLogs(res.data.data || res.data.items || res.data || []);
        setTotal(res.data.totalPages || 1);
      } catch { setError('Failed to load audit logs.'); }
      finally { setLoading(false); }
    })();
  }, [page]);

  const truncate = (str, n = 60) => str && str.length > n ? str.slice(0, n) + '…' : (str || '—');

  const columns = [
    { key: 'entityName', label: 'Entity' },
    { key: 'action',     label: 'Action' },
    { key: 'oldValue',   label: 'Old Value', render: (v) => <span className="text-gray-400 font-mono text-xs">{truncate(v)}</span> },
    { key: 'newValue',   label: 'New Value', render: (v) => <span className="text-gray-700 font-mono text-xs">{truncate(v)}</span> },
    { key: 'userId',     label: 'User ID' },
    { key: 'timestamp',  label: 'Timestamp', render: (v) => v ? new Date(v).toLocaleString() : '—' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-0.5">Read-only record of all system changes</p>
      </div>

      {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

      <Table columns={columns} data={logs} isLoading={loading} emptyMessage="No audit logs found." />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
