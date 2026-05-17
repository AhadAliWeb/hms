import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getById, update } from '../../../api/doctorApi';
import Loader from '../../../components/shared/Loader';

const FIELDS = [
  { name: 'fullName',        label: 'Full Name',          type: 'text' },
  { name: 'email',           label: 'Email',              type: 'email' },
  { name: 'specialization',  label: 'Specialization',     type: 'text' },
  { name: 'qualification',   label: 'Qualification',      type: 'text' },
  { name: 'experienceYears', label: 'Experience (years)', type: 'number' },
  { name: 'consultationFee', label: 'Consultation Fee',   type: 'number' },
];

export default function DoctorEdit() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getById(id);
        setForm(res.data);
      } catch {
        setError('Failed to load doctor.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await update(id, form);
      navigate('/admin/doctors');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update doctor.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="relative h-48"><Loader /></div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/doctors')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Doctor</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update doctor information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.name} className={f.name === 'fullName' || f.name === 'email' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">{f.label}</label>
              <input
                name={f.name}
                type={f.type}
                value={form[f.name] ?? ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}

          <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => navigate('/admin/doctors')} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-60">
              {saving ? 'Saving…' : 'Update Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
