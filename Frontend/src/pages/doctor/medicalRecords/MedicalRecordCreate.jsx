// import { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate, useParams } from 'react-router-dom';
// import { AlertCircle, ArrowLeft, Save } from 'lucide-react';

// import Spinner from '../../../components/shared/Spinner';
// import { createMedicalRecord } from '../../../api/medicalRecordApi';
// import { getAppointmentsByDoctor } from '../../../api/appointmentApi';
// import axiosInstance from '../../../api/axiosInstance';

// const inputCls =
//   'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
// const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

// export default function MedicalRecordCreate() {
//   const { user } = useSelector((s) => s.auth);
//   const doctorId = user?.doctorId || user?.id;
//   const navigate = useNavigate();

//   const { appointmentId, patientId } = useParams();

//   console.log(appointmentId, patientId);
  

//   const [patients,     setPatients]     = useState([]);
//   const [appointments, setAppointments] = useState([]);

//   const [form, setForm] = useState({
//     patientId:     '',
//     appointmentId: '',
//     diagnosis:     '',
//     prescription:  '',
//     notes:         '',
//   });

//   const [submitting, setSubmitting] = useState(false);
//   const [error,      setError]      = useState('');

//   // Load patients
//   useEffect(() => {
//     axiosInstance.get('/patient', { params: { page: 1, pageSize: 100 } })
//       .then((r) => setPatients(r.data?.data || r.data || []))
//       .catch(() => {});
//   }, []);

//   // Load completed appointments when patient changes
//   useEffect(() => {
//     if (!form.patientId) { setAppointments([]); return; }
//     getAppointmentsByDoctor(doctorId, 1, 100)
//       .then((r) => {
//         const all = r.data?.data || r.data || [];
//         setAppointments(all.filter(
//           (a) => String(a.patientId) === String(form.patientId) && a.status === 'Completed'
//         ));
//       })
//       .catch(() => {});
//   }, [form.patientId, doctorId]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//     if (name === 'patientId') setForm((prev) => ({ ...prev, patientId: value, appointmentId: '' }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.patientId || !form.appointmentId || !form.diagnosis.trim()) {
//       setError('Patient, Appointment, and Diagnosis are required.');
//       return;
//     }
//     try {
//       setSubmitting(true);
//       setError('');
//       await createMedicalRecord({
//         patientId:     Number(form.patientId),
//         doctorId:      Number(doctorId),
//         appointmentId: Number(form.appointmentId),
//         diagnosis:     form.diagnosis,
//         prescription:  form.prescription,
//         notes:         form.notes,
//       });
//       navigate('/doctor/medical-records');
//     } catch (err) {
//       setError(err?.response?.data?.message || 'Failed to create medical record.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="space-y-4 max-w-2xl">
//       {/* Header */}
//       <div className="flex items-center gap-3">
//         <button
//           onClick={() => navigate(-1)}
//           className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
//         >
//           <ArrowLeft size={18} />
//         </button>
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Create Medical Record</h2>
//           <p className="text-sm text-gray-500 mt-0.5">Only for completed appointments</p>
//         </div>
//       </div>

//       {error && (
//         <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
//           <AlertCircle size={16} /> {error}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
//         {/* Patient */}
//         <div>
//           <label className={labelCls}>Patient *</label>
//           <select name="patientId" value={form.patientId} onChange={handleChange} className={inputCls} required>
//             <option value="">Select patient…</option>
//             {/* {patients.length > 0 && patients.map((p) => (
//               <option key={p.id} value={p.id}>{p.fullName || p.name}</option>
//             ))} */}
//           </select>
//         </div>

//         {/* Appointment */}
//         <div>
//           <label className={labelCls}>Appointment (Completed only) *</label>
//           <select
//             name="appointmentId"
//             value={form.appointmentId}
//             onChange={handleChange}
//             className={inputCls}
//             disabled={!form.patientId}
//             required
//           >
//             <option value="">
//               {form.patientId ? (appointments.length ? 'Select appointment…' : 'No completed appointments') : 'Select patient first'}
//             </option>
//             {appointments.length > 0 && appointments.map((a) => (
//               <option key={a.id} value={a.id}>
//                 {a.id} — {new Date(a.date).toLocaleDateString()}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Diagnosis */}
//         <div>
//           <label className={labelCls}>Diagnosis *</label>
//           <input
//             name="diagnosis"
//             value={form.diagnosis}
//             onChange={handleChange}
//             className={inputCls}
//             placeholder="e.g. Mild Fever"
//             required
//           />
//         </div>

//         {/* Prescription */}
//         <div>
//           <label className={labelCls}>Prescription (text summary)</label>
//           <textarea
//             name="prescription"
//             value={form.prescription}
//             onChange={handleChange}
//             className={`${inputCls} resize-none`}
//             rows={3}
//             placeholder="e.g. Rest and fluids"
//           />
//         </div>

//         {/* Notes */}
//         <div>
//           <label className={labelCls}>Notes</label>
//           <textarea
//             name="notes"
//             value={form.notes}
//             onChange={handleChange}
//             className={`${inputCls} resize-none`}
//             rows={3}
//             placeholder="e.g. Follow up in 7 days"
//           />
//         </div>

//         {/* Submit */}
//         <div className="flex flex-col sm:flex-row gap-2 pt-2">
//           <button
//             type="submit"
//             disabled={submitting}
//             className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
//           >
//             {submitting ? <Spinner size="sm" color="text-white" /> : <Save size={15} />}
//             {submitting ? 'Saving…' : 'Save Record'}
//           </button>
//           <button
//             type="button"
//             onClick={() => navigate(-1)}
//             className="px-5 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';

import Spinner from '../../../components/shared/Spinner';
import { createMedicalRecord } from '../../../api/medicalRecordApi';

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

const labelCls =
  'block text-xs font-medium text-gray-600 mb-1';

export default function MedicalRecordCreate() {
  const { user } = useSelector((s) => s.auth);


  const navigate = useNavigate();

  const { appointmentId, patientId } = useParams();

  const [form, setForm] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.diagnosis.trim()) {
      setError('Diagnosis is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await createMedicalRecord({
        patientId: Number(patientId),
        appointmentId: Number(appointmentId),
        diagnosis: form.diagnosis,
        prescription: form.prescription,
        notes: form.notes,
      });

      navigate('/doctor/medical-records');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Failed to create medical record.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Create Medical Record
          </h2>

          <p className="text-sm text-gray-500 mt-0.5">
            Add diagnosis and treatment notes
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
      >
        {/* Diagnosis */}
        <div>
          <label className={labelCls}>Diagnosis *</label>

          <input
            type="text"
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            className={inputCls}
            placeholder="e.g. Mild Fever"
            required
          />
        </div>

        {/* Prescription */}
        <div>
          <label className={labelCls}>
            Prescription
          </label>

          <textarea
            name="prescription"
            value={form.prescription}
            onChange={handleChange}
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="e.g. Paracetamol twice daily"
          />
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes</label>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="e.g. Follow up after 7 days"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? (
              <Spinner size="sm" color="text-white" />
            ) : (
              <Save size={15} />
            )}

            {submitting ? 'Saving…' : 'Save Record'}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}