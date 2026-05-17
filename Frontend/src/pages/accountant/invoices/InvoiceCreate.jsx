import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import Spinner from '../../../components/shared/Spinner';
import { getAll as getPatients } from '../../../api/patientApi';
import { getAppointmentsByPatient } from '../../../api/appointmentApi';
import { create as createInvoice } from '../../../api/invoiceApi';

function SearchDropdown({ label, placeholder, value, results, loading, onSearch, onSelect, disabled }) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const wrapRef             = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    onSearch(val);
  };

  const handleSelect = (item) => {
    onSelect(item);
    setQuery(item.label);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1" ref={wrapRef}>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={value ? value.label : query}
          onChange={handleChange}
          onFocus={() => { if (!value) setOpen(true); }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </span>
        )}
        {!loading && <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}

        {open && results.length > 0 && (
          <ul className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
            {results.map((item) => (
              <li
                key={item.id}
                onMouseDown={() => handleSelect(item)}
                className="px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
              >
                {item.label}
              </li>
            ))}
          </ul>
        )}

        {open && !loading && results.length === 0 && query.length > 0 && (
          <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-400">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoiceCreate({ onClose, onCreated }) {
  const [patient, setPatient]               = useState(null);
  const [appointment, setAppointment]       = useState(null);
  const [patientResults, setPatientResults] = useState([]);
  const [apptResults, setApptResults]       = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [apptLoading, setApptLoading]       = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState(false);

  const patientTimer = useRef(null);
  const apptTimer    = useRef(null);

  const searchPatients = (q) => {
    clearTimeout(patientTimer.current);
    if (!q) { setPatientResults([]); return; }
    patientTimer.current = setTimeout(async () => {
      setPatientLoading(true);
      try {
        const res = await getPatients(1, 100, q);
        const list = res.data?.data ?? res.data ?? [];
        setPatientResults(
          list.map((p) => ({ id: p.id, label: p.fullName ?? p.name ?? `Patient #${p.id}` }))
        );
      } catch {
        setPatientResults([]);
      } finally {
        setPatientLoading(false);
      }
    }, 350);
  };

  const searchAppointments = (q) => {
    if (!patient) return;
    clearTimeout(apptTimer.current);
    apptTimer.current = setTimeout(async () => {
      setApptLoading(true);
      try {
        const res = await getAppointmentsByPatient(patient.id, 1, 100, q, 'Completed');
        const list = res.data?.data ?? res.data ?? [];
        setApptResults(
          list.map((a) => ({
            id: a.id,
            label: `${a.doctorName ?? 'Dr.'} — ${a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : a.date ?? ''}`,
          }))
        );
      } catch {
        setApptResults([]);
      } finally {
        setApptLoading(false);
      }
    }, 350);
  };

  const handleSelectPatient = (p) => {
    setPatient(p);
    setAppointment(null);
    setApptResults([]);
  };

  const handleSubmit = async () => {
    if (!patient) { setError('Please select a patient.'); return; }
    if (!appointment) { setError('Please select an appointment.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await createInvoice({ patientId: patient.id, appointmentId: appointment.id });
      setSuccess(true);
      setTimeout(() => { onCreated?.(); onClose?.(); }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to generate invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <SearchDropdown
        label="Patient"
        placeholder="Search patient by name..."
        value={patient}
        results={patientResults}
        loading={patientLoading}
        onSearch={searchPatients}
        onSelect={handleSelectPatient}
      />

      <SearchDropdown
        label="Appointment (Completed)"
        placeholder={patient ? 'Search appointment...' : 'Select a patient first'}
        value={appointment}
        results={apptResults}
        loading={apptLoading}
        onSearch={searchAppointments}
        onSelect={setAppointment}
        disabled={!patient}
      />

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          Invoice generated successfully!
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || success}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting && <Spinner size="sm" color="text-white" />}
          Generate Invoice
        </button>
      </div>
    </div>
  );
}
