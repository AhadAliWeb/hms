import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';

import Spinner from '../../../components/shared/Spinner';
import { createLabOrder } from '../../../api/labOrderApi';
import { getAllAppointments, getAppointmentsByDoctor } from '../../../api/appointmentApi';
import { getAll } from "../../../api/labTestApi";
import axiosInstance from '../../../api/axiosInstance';

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

export default function LabOrderCreate() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  // const [patients,     setPatients]     = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [labTests,     setLabTests]     = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchingPatients, setSearchingPatients] = useState(false);

  const [form, setForm] = useState({
    patientId:     '',
    appointmentId: '',
    doctorId:     '',
    labTestId:     '',
    notes:         '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  console.log(form)

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const res = await getAll(1, 100);
        setLabTests(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to load lab tests:', err);
      }
    };

    fetchLabTests();
  }, []);

  useEffect(() => {
      if (!patientSearch) {
        setPatientResults([]);
        return;
      }
  
      const delayDebounce = setTimeout(async () => {
        try {
          setSearchingPatients(true);
  
          // page, pageSize, Search, Status = "Completed"
          const res = await getAllAppointments(1, 10, patientSearch, "Completed");
  
          const appointments = res.data;
  
          setPatientResults(appointments);
        } catch (err) {
          console.error(err);
        } finally {
          setSearchingPatients(false);
        }
      }, 400);
  
      return () => clearTimeout(delayDebounce);
    }, [patientSearch]);

  // useEffect(() => {
  //   if (!form.patientId) { setAppointments([]); return; }
  //   getAppointmentsByDoctor(doctorId, 1, 100)
  //     .then((r) => {
  //       const all = r.data?.data || r.data || [];
  //       setAppointments(all.filter(
  //         (a) => String(a.patientId) === String(form.patientId) && a.status === 'Completed'
  //       ));
  //     }).catch(() => {});
  // }, [form.patientId, doctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'patientId') {
      setForm({ patientId: value, appointmentId: '', labTestId: '', notes: form.notes });
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.appointmentId || !form.doctorId || !form.labTestId) {
      setError('Patient, Appointment, Doctor, and Lab Test are required.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await createLabOrder({
        patientId:     Number(form.patientId),
        doctorId:      Number(form.doctorId),
        labTestId:     Number(form.labTestId),
        appointmentId: Number(form.appointmentId),
        notes:         form.notes,
      });
      navigate('/doctor/lab-orders');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create lab order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Lab Order</h2>
          <p className="text-sm text-gray-500 mt-0.5">Order a lab test for a patient</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        {/* Patient */}
          <div className="relative">
            <label className={labelCls}>Search Patient *</label>

            <input
              type="text"
              value={patientSearch}
              onChange={(e) => {
                setPatientSearch(e.target.value);
                setSelectedPatient(null);

                setForm((prev) => ({
                  ...prev,
                  patientId: '',
                  appointmentId: '',
                }));
              }}
              className={inputCls}
              placeholder="Search patient by name..."
            />

            {patientResults.length > 0 && !selectedPatient && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {patientResults.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatient(patient);

                      setForm((prev) => ({
                        ...prev,
                        appointmentId: patient.id,
                        patientId: patient.patientId,
                        doctorId: patient.doctorId,
                      }));

                      setPatientSearch(patient.fullName || patient.name);
                      setPatientResults([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {patient.patientName} - {patient.doctorName} {' '} {new Date(patient.appointmentDate).toLocaleDateString()}
                    </p>

                    {/* {patient.phone && (
                      <p className="text-xs text-gray-500">
                        {patient.phone}
                      </p>
                    )} */}
                  </button>
                ))}
              </div>
            )}

            {searchingPatients && (
              <p className="text-xs text-gray-500 mt-1">
                Searching patients...
              </p>
            )}
          </div>

        {/* Lab Test */}
        <div>
          <label className={labelCls}>Lab Test *</label>
          <select name="labTestId" value={form.labTestId} onChange={handleChange} className={inputCls} required>
            <option value="">Select lab test…</option>
            {labTests.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className={`${inputCls} resize-none`}
            rows={3}
            placeholder="e.g. Check for infection"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button type="submit" disabled={submitting}
            className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {submitting ? <Spinner size="sm" color="text-white" /> : <Save size={15} />}
            {submitting ? 'Saving…' : 'Create Lab Order'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
