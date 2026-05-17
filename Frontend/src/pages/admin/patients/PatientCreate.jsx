import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { create } from '../../../api/patientApi';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const INITIAL = { fullName: '', email: '', password: '', bloodGroup: '', address: '', dateOfBirth: '', emergencyContact: '' };

export default function PatientCreate() {
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
      navigate('/admin/patients');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/patients')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ArrowLeft size={18}/></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Patient</h1>
          <p className="text-sm text-gray-500 mt-0.5">Register a new patient</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'fullName', label: 'Full Name', type: 'text', span: true },
            { name: 'email',    label: 'Email',     type: 'email', span: true },
            { name: 'password', label: 'Password',  type: 'password', span: false },
            { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', span: false },
            { name: 'emergencyContact', label: 'Emergency Contact', type: 'text', span: false },
            { name: 'address',  label: 'Address', type: 'text', span: false },
          ].map((f) => (
            <div key={f.name} className={f.span ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">{f.label} <span className="text-red-500">*</span></label>
              <input
                name={f.name} type={f.type} required
                value={form[f.name]} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Blood Group</label>
            <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select…</option>
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => navigate('/admin/patients')} className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium disabled:opacity-60">
              {loading ? 'Saving…' : 'Create Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
