import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { create } from '../../../api/admissionApi';
import { getAll as getPatients } from '../../../api/patientApi';
import { getAll as getDoctors }  from '../../../api/doctorApi';
import { getAll as getWards }    from '../../../api/wardApi';
import { getAvailableByWard }    from '../../../api/bedApi';
import SearchDropdown from '../appointments/SearchDropdown';
import Spinner from '../../../components/shared/Spinner';

export default function AdmissionCreate() {
  const navigate = useNavigate();
  const [patient, setPatient]   = useState(null);
  const [doctor, setDoctor]     = useState(null);
  const [wardId, setWardId]     = useState('');
  const [bedId, setBedId]       = useState('');
  const [notes, setNotes]       = useState('');
  const [wards, setWards]       = useState([]);
  const [beds, setBeds]         = useState([]);
  const [bedsLoading, setBedsLoading] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]       = useState('');

  // Load wards on mount
  useEffect(() => {
    getWards(1, 100)
      .then((res) => setWards(res.data?.data ?? res.data ?? []))
      .catch(() => {});
  }, []);

  // Load available beds when ward changes
  useEffect(() => {
    if (!wardId) { setBeds([]); setBedId(''); return; }
    setBedsLoading(true);
    setBedId('');
    getAvailableByWard(wardId)
      .then((res) => setBeds(res.data?.data ?? res.data ?? []))
      .catch(() => setBeds([]))
      .finally(() => setBedsLoading(false));
  }, [wardId]);

  const searchPatients = async (term) => {
    const res = await getPatients(1, 100, term);
    return res.data?.data ?? res.data ?? [];
  };

  const searchDoctors = async (term) => {
    const res = await getDoctors(1, 100, term);
    return res.data?.data ?? res.data ?? [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient) { setError('Please select a patient.'); return; }
    if (!doctor)  { setError('Please select a doctor.'); return; }
    if (!bedId)   { setError('Please select a bed.'); return; }
    setIsLoading(true);
    setError('');
    try {
      await create({
        patientId: patient.id,
        doctorId:  doctor.id,
        bedId:     Number(bedId),
        notes,
      });
      navigate('/receptionist/admissions');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to admit patient.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admit Patient</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a new hospital admission</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <SearchDropdown
            label="Patient"
            placeholder="Type patient name…"
            onSearch={searchPatients}
            getLabel={(p) => `${p.fullName} — ${p.email}`}
            selected={patient}
            onSelect={setPatient}
            required
          />

          <SearchDropdown
            label="Doctor"
            placeholder="Type doctor name…"
            onSearch={searchDoctors}
            getLabel={(d) => `${d.fullName}${d.specialization ? ' — ' + d.specialization : ''}`}
            selected={doctor}
            onSelect={setDoctor}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Ward *</label>
              <select
                required
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select ward</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Bed *</label>
              <select
                required
                value={bedId}
                onChange={(e) => setBedId(e.target.value)}
                disabled={!wardId || bedsLoading}
                className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
              >
                <option value="">
                  {bedsLoading ? 'Loading beds…' : wardId ? 'Select bed' : 'Select ward first'}
                </option>
                {beds.map((b) => (
                  <option key={b.id} value={b.id}>
                    Bed {b.bedNumber}{b.type ? ` — ${b.type}` : ''}
                  </option>
                ))}
              </select>
              {wardId && !bedsLoading && beds.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">No available beds in this ward.</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Post-surgery observation"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => navigate(-1)}
              className="rounded-lg bg-gray-100 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {isLoading && <Spinner size="sm" color="text-white" />}
              Admit Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
