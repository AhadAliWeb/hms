import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createAppointment } from '../../../api/appointmentApi';
import { getAll as getPatients } from '../../../api/patientApi';
import { getAll as getDoctors }  from '../../../api/doctorApi';
import SearchDropdown from './SearchDropdown';
import Spinner from '../../../components/shared/Spinner';

export default function AppointmentCreate() {
  const navigate          = useNavigate();
  const [patient, setPatient]     = useState(null);
  const [doctor, setDoctor]       = useState(null);
  const [date, setDate]           = useState('');
  const [notes, setNotes]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

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
    setIsLoading(true);
    setError('');
    try {
      await createAppointment({
        patientId: patient.id,
        doctorId:  doctor.id,
        appointmentDate: date,
        notes,
      });
      navigate('/receptionist/appointments');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule a new patient appointment</p>
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

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Appointment Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Regular checkup"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
