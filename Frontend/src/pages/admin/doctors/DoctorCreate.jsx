import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { create } from '../../../api/doctorApi';

const FIELDS = [
  { name: 'fullName',        label: 'Full Name',          type: 'text',   required: true },
  { name: 'email',           label: 'Email',              type: 'email',  required: true },
  { name: 'password',        label: 'Password',           type: 'password', required: true },
  { name: 'specialization',  label: 'Specialization',     type: 'text',   required: true },
  { name: 'qualification',   label: 'Qualification',      type: 'text',   required: true },
  { name: 'experienceYears', label: 'Experience (years)', type: 'number', required: false },
  { name: 'consultationFee', label: 'Consultation Fee',   type: 'number', required: false },
];

const INITIAL = Object.fromEntries(FIELDS.map((f) => [f.name, '']));

export default function DoctorCreate() {
  const navigate = useNavigate();
  const [form, setForm]     = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await create(form);
      navigate('/admin/doctors');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/doctors')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Doctor</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a new doctor account</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.name} className={f.name === 'fullName' || f.name === 'email' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">{f.label}{f.required && <span className="text-red-500 ml-0.5">*</span>}</label>
              <input
                name={f.name}
                type={f.type}
                required={f.required}
                value={form[f.name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}

          <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => navigate('/admin/doctors')} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium disabled:opacity-60">
              {loading ? 'Saving…' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
