import { useState } from 'react';
import { updateAppointmentStatus, createAppointment } from '../../../api/appointmentApi';
import Modal from '../../../components/shared/Modal';
import Spinner from '../../../components/shared/Spinner';
import axiosInstance from '../../../api/axiosInstance';

export default function AppointmentReschedule({ appointment, onClose, onSuccess }) {
  const [appointmentDate, setAppointmentDate] = useState(
    appointment.appointmentDate
      ? appointment.appointmentDate.slice(0, 16)
      : ''
  );
  const [notes, setNotes]         = useState(appointment.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async () => {
    if (!appointmentDate) { setError('Please select a date.'); return; }
    setIsLoading(true);
    setError('');
    try {
      // Cancel existing, create new
      await updateAppointmentStatus(appointment.id, 'Cancelled');
      await createAppointment({
        patientId: appointment.patientId ?? appointment.patient?.id,
        doctorId:  appointment.doctorId  ?? appointment.doctor?.id,
        appointmentDate,
        notes,
      });
      onSuccess();
    } catch {
      setError('Failed to reschedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Reschedule Appointment" size="sm">
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">New Date & Time *</label>
          <input
            type="datetime-local"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isLoading && <Spinner size="sm" color="text-white" />}
          Reschedule
        </button>
      </div>
    </Modal>
  );
}
