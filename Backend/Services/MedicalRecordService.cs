using Backend.Interfaces;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly AppDbContext _context;

        public MedicalRecordService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MedicalRecordResponseDto> CreateAsync(CreateMedicalRecordDto dto)
        {
            var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == dto.PatientId);
            if (patient == null) throw new Exception("Patient not found");

            var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == dto.DoctorId);
            if (doctor == null) throw new Exception("Doctor not found");

            var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.PatientId == dto.PatientId && a.DoctorId == dto.DoctorId && a.Id == dto.AppointmentId && a.Status == "Completed");
            if (appointment == null) throw new Exception("No completed appointment found between patient and doctor");

            var medicalRecord = new MedicalRecord
            {
                DoctorId = dto.DoctorId,
                AppointmentId = appointment.Id,
                PatientId = dto.PatientId,
                Diagnosis = dto.Diagnosis,
                Prescription = dto.Prescription,
                Notes = dto.Notes
            };

            _context.MedicalRecords.Add(medicalRecord);
            await _context.SaveChangesAsync();

            return new MedicalRecordResponseDto
            {
                Id = medicalRecord.Id,
                PatientName = patient.User.FullName,
                DoctorName = doctor.User.FullName,
                Diagnosis = medicalRecord.Diagnosis,
                Prescription = medicalRecord.Prescription,
                Notes = medicalRecord.Notes,
                RecordDate = medicalRecord.CreatedAt,
            };
        }

        public async Task<MedicalRecordResponseDto?> GetByIdAsync(int id)
        {
            var record = await _context.MedicalRecords
                .Include(r => r.Patient).ThenInclude(p => p.User)
                .Include(r => r.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (record == null) return null;

            return new MedicalRecordResponseDto
            {
                Id = record.Id,
                PatientName = record.Patient.User.FullName,
                DoctorName = record.Doctor.User.FullName,
                Diagnosis = record.Diagnosis,
                Prescription = record.Prescription,
                Notes = record.Notes,
                RecordDate = record.CreatedAt,
            };
        }

        public async Task<IEnumerable<MedicalRecordResponseDto>> GetByPatientIdAsync(int patientId, int page, int pageSize)
        {
            return await _context.MedicalRecords
                .Where(r => r.PatientId == patientId)
                .Include(r => r.Patient).ThenInclude(p => p.User)
                .Include(r => r.Doctor).ThenInclude(d => d.User)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(record => new MedicalRecordResponseDto
                {
                    Id = record.Id,
                    PatientName = record.Patient.User.FullName,
                    DoctorName = record.Doctor.User.FullName,
                    Diagnosis = record.Diagnosis,
                    Prescription = record.Prescription,
                    Notes = record.Notes,
                    RecordDate = record.CreatedAt,
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<MedicalRecordResponseDto>> GetByDoctorIdAsync(int doctorId, int page, int pageSize)
        {
            return await _context.MedicalRecords
                .Where(r => r.DoctorId == doctorId)
                .Include(r => r.Patient).ThenInclude(p => p.User)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(record => new MedicalRecordResponseDto
                {
                    Id = record.Id,
                    PatientName = record.Patient.User.FullName,
                    DoctorName = record.Doctor.User.FullName,
                    Diagnosis = record.Diagnosis,
                    Prescription = record.Prescription,
                    Notes = record.Notes,
                    RecordDate = record.CreatedAt,
                })
                .ToListAsync();

        }

        public async Task<bool> DeleteAsync(int id)
        {
            var record = await _context.MedicalRecords.FindAsync(id);
            if (record == null) return false;

            _context.MedicalRecords.Remove(record);
            await _context.SaveChangesAsync();
            return true;

        }


    }
}