import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { create } from '../../../api/patientApi';
import Spinner from '../../../components/shared/Spinner';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  bloodGroup: '',
  address: '',
  dateOfBirth: '',
  emergencyContact: '',
};

export default function PatientCreate() {
  const navigate    = useNavigate();
  const [form, setForm]       = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await create(form);
      navigate('/receptionist/patients');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to register patient.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register Patient</h1>
          <p className="text-sm text-gray-500 mt-0.5">Add a new patient record</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input name="fullName" required value={form.fullName} onChange={handleChange}
                placeholder="Alice Brown" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                placeholder="alice@gmail.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Password *</label>
              <input name="password" type="password" required value={form.password} onChange={handleChange}
                placeholder="••••••••" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Blood Group *</label>
              <select name="bloodGroup" required value={form.bloodGroup} onChange={handleChange}
                className={inputClass}>
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth *</label>
              <input name="dateOfBirth" type="date" required value={form.dateOfBirth} onChange={handleChange}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Emergency Contact *</label>
              <input name="emergencyContact" required value={form.emergencyContact} onChange={handleChange}
                placeholder="0300-1234567" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Address</label>
            <textarea name="address" rows={2} value={form.address} onChange={handleChange}
              placeholder="123 Main St, City" className={inputClass} />
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {isLoading && <Spinner size="sm" color="text-white" />}
              Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
