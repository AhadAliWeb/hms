import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

import Spinner from '../../../components/shared/Spinner';
import { createPrescription } from '../../../api/prescriptionApi';
import { getAppointmentsByDoctor, getAllAppointments } from '../../../api/appointmentApi';
import { getAll } from '../../../api/medicineApi';
import axiosInstance from '../../../api/axiosInstance';

const inputCls =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const labelCls = 'block text-xs font-medium text-gray-600 mb-1';

const BLANK_ITEM = {
  medicineId: '',
  medicineName: '',
  dosage: '',
  frequency: '',
  durationDays: '',
  quantity: '',
  searchResults: [],
  searching: false,
};

export default function PrescriptionCreate() {
  const { user } = useSelector((s) => s.auth);
  const doctorId = user?.doctorId || user?.id;
  const navigate = useNavigate();

  const [patients,     setPatients]     = useState([]);
  
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientResults, setPatientResults] = useState([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  // const [medicinesResults,    setMedicinesResults]    = useState([]);
  // const [searchingMedicine, setSearchingMedicine] = useState(false);
  // const [medicineSearch, setMedicineSearch] = useState('');

  const [form, setForm] = useState({ patientId: '', doctorId: '',appointmentId: '' });
  const [items, setItems] = useState([{ ...BLANK_ITEM }]);

  

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  

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


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'patientId') {
      setForm({ patientId: value, appointmentId: '' });
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  const handleMedicineSearch = async (index, value) => {
  handleItemChange(index, 'medicineName', value);

      if (!value) {
        setItems((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, searchResults: [] }
              : item
          )
        );
        return;
      }

      try {
        setItems((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, searching: true }
              : item
          )
        );

        const res = await getAll(1, 10, value, "Completed");

        setItems((prev) =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  searchResults: res.data,
                  searching: false,
                }
              : item
          )
        );
      } catch (err) {
        console.error(err);

        setItems((prev) =>
          prev.map((item, i) =>
            i === index
              ? { ...item, searching: false }
              : item
          )
        );
      }
    };

  const addItem    = () => setItems((p) => [...p, { ...BLANK_ITEM }]);
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.appointmentId) {
      setError('Patient and Appointment are required.');
      return;
    }
    if (items.some((it) => !it.medicineId)) {
      setError('Select a medicine for each item.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await createPrescription({
        patientId:     Number(form.patientId),
        doctorId:      Number(form.doctorId),
        appointmentId: Number(form.appointmentId),
        items: items.map((it) => ({
          medicineId:  Number(it.medicineId),
          dosage:     it.dosage,
          frequency:   it.frequency,
          durationDays: Number(it.durationDays),
          quantity:    Number(it.quantity),
        })),
      });
      navigate('/doctor/prescriptions');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Prescription</h2>
          <p className="text-sm text-gray-500 mt-0.5">Add medicine items for a completed appointment</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient & Appointment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      setPatientSearch('');
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

          <div>
            <label className={labelCls}>Selected Patient</label>
            <p className="text-lg font-bold text-blue-600">
              {selectedPatient ? selectedPatient.patientName : 'No patient selected'}
            </p>
          </div>

        </div>

        {/* Medicine Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Medicine Items</h3>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
              <Plus size={13} /> Add Item
            </button>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Item {idx + 1}</span>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)}
                    className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <label className={labelCls}>Search Medicine *</label>

                  <input
                    type="text"
                    value={item.medicineName}
                    onChange={(e) => handleMedicineSearch(idx, e.target.value)}
                    className={inputCls}
                    placeholder="Search Medicine by name..."
                  />

                  {item.searchResults.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {item.searchResults.map((medicine) => (
                        <button
                          key={medicine.id}
                          type="button"
                          onClick={() => {
                            setItems((prev) =>
                              prev.map((it, i) =>
                                i === idx
                                  ? {
                                      ...it,
                                      medicineId: medicine.id,
                                      medicineName: medicine.name,
                                      dosage: medicine.unit,
                                      searchResults: [],
                                    }
                                  : it
                              )
                            );
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="text-sm font-medium text-gray-800">
                            {medicine.name} - {medicine.unit}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {item.searching && (
                    <p className="text-xs text-gray-500 mt-1">
                      Searching medicines...
                    </p>
                  )}
                </div>
                {/* <div>
                  <label className={labelCls}>Dosage</label>
                  <input value={item.dosage}
                    onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                    className={inputCls} placeholder="e.g. 500mg" />
                </div> */}
                <div>
                  <label className={labelCls}>Dosage</label>

                  <input
                    value={item.dosage}
                    readOnly
                    className={`${inputCls} bg-gray-100`}
                    placeholder="Auto filled"
                  />
                </div>
                <div>
                  <label className={labelCls}>Frequency</label>
                  <input value={item.frequency}
                    onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                    className={inputCls} placeholder="e.g. Twice a day" />
                </div>
                <div>
                  <label className={labelCls}>Duration (days)</label>
                  <input type="number" min="1" value={item.durationDays}
                    onChange={(e) => handleItemChange(idx, 'durationDays', e.target.value)}
                    className={inputCls} placeholder="e.g. 5" />
                </div>
                <div>
                  <label className={labelCls}>Quantity</label>
                  <input type="number" min="1" value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className={inputCls} placeholder="e.g. 10" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button type="submit" disabled={submitting}
            className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {submitting ? <Spinner size="sm" color="text-white" /> : <Save size={15} />}
            {submitting ? 'Saving…' : 'Save Prescription'}
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
