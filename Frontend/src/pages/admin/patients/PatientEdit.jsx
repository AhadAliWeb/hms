import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getById, update } from '../../../api/patientApi';
import Loader from '../../../components/shared/Loader';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientEdit() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [form, setForm]     = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getById(id);
        setForm(res.data);
      } catch { setError('Failed to load patient.'); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await update(id, form);
      navigate('/admin/patients');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update patient.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="relative h-48"><Loader /></div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/patients')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ArrowLeft size={18}/></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update patient information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'fullName', label: 'Full Name', type: 'text', span: true },
            { name: 'email', label: 'Email', type: 'email', span: true },
            { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
            { name: 'emergencyContact', label: 'Emergency Contact', type: 'text' },
            { name: 'address', label: 'Address', type: 'text', span: true },
          ].map((f) => (
            <div key={f.name} className={f.span ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">{f.label}</label>
              <input
                name={f.name} type={f.type}
                value={form[f.name] ?? ''} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Blood Group</label>
            <select name="bloodGroup" value={form.bloodGroup ?? ''} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select…</option>
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => navigate('/admin/patients')} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 font-medium">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium disabled:opacity-60">
              {saving ? 'Saving…' : 'Update Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
