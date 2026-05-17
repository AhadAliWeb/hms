using Backend.Interfaces;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly AppDbContext _context;

        public AppointmentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AppointmentResponseDto> CreateAsync(CreateAppointmentDto dto)
        {

            var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == dto.DoctorId);
            if (doctor == null) throw new Exception("Doctor not found");
            var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == dto.PatientId);
            if (patient == null) throw new Exception("Patient not found");

            var appointment = new Appointment
            {
                DoctorId = dto.DoctorId,
                PatientId = dto.PatientId,
                AppointmentDate = dto.AppointmentDate,
                Notes = dto.Notes,
                Status = "Scheduled",
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return new AppointmentResponseDto
            {
                Id = appointment.Id,
                AppointmentDate = appointment.AppointmentDate,
                Status = appointment.Status,
                Notes = appointment.Notes,
                DoctorName = doctor.User.FullName,
                PatientName = patient.User.FullName,
                PatientId = patient.Id,
                DoctorId = doctor.Id
            };
        }

        public async Task<AppointmentResponseDto?> GetByIdAsync(int id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null) return null;

            return new AppointmentResponseDto
            {
                Id = appointment.Id,
                AppointmentDate = appointment.AppointmentDate,
                Status = appointment.Status,
                Notes = appointment.Notes,
                DoctorName = appointment.Doctor.User.FullName,
                PatientName = appointment.Patient.User.FullName,
                PatientId = appointment.Patient.Id,
                DoctorId = appointment.Doctor.Id
            };
        }

        public async Task<IEnumerable<AppointmentResponseDto>> GetAllAsync(int page, int pageSize, string? search, string? status)
        {
            var query = _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .OrderByDescending(a => a.AppointmentDate).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a => a.Patient.User.FullName.Contains(search) || a.Doctor.User.FullName.Contains(search));
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status == status);
            }

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(appointment => new AppointmentResponseDto
                {
                    Id = appointment.Id,
                    AppointmentDate = appointment.AppointmentDate,
                    Status = appointment.Status,
                    Notes = appointment.Notes,
                    DoctorName = appointment.Doctor.User.FullName,
                    PatientName = appointment.Patient.User.FullName,
                    PatientId = appointment.Patient.Id,
                    DoctorId = appointment.Doctor.Id
                })
                .ToListAsync();
        }
        
        public async Task<IEnumerable<AppointmentResponseDto>> GetByPatientIdAsync(int patientId, int page, int pageSize, string? search, string? status)
        {
            var query = _context.Appointments
                .Where(a => a.PatientId == patientId)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient).ThenInclude(p => p.User).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a => a.Patient.User.FullName.Contains(search) || a.Doctor.User.FullName.Contains(search));
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(a => a.Status == status);
            }

            return await query
                .OrderByDescending(a => a.AppointmentDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(appointment => new AppointmentResponseDto
                {
                    Id = appointment.Id,
                    AppointmentDate = appointment.AppointmentDate,
                    Status = appointment.Status,
                    Notes = appointment.Notes,
                    DoctorName = appointment.Doctor.User.FullName,
                    PatientName = appointment.Patient.User.FullName,
                    PatientId = appointment.Patient.Id,
                    DoctorId = appointment.Doctor.Id
                })
                .ToListAsync();

        }

        public async Task<IEnumerable<AppointmentResponseDto?>> GetByDoctorIdAsync(int doctorId, int page, int pageSize)
        {
            return await _context.Appointments
                .Where(a => a.DoctorId == doctorId)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .OrderByDescending(a => a.AppointmentDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(appointment => new AppointmentResponseDto
                {
                    Id = appointment.Id,
                    AppointmentDate = appointment.AppointmentDate,
                    Status = appointment.Status,
                    Notes = appointment.Notes,
                    DoctorName = appointment.Doctor.User.FullName,
                    PatientName = appointment.Patient.User.FullName,
                    PatientId = appointment.Patient.Id,
                    DoctorId = appointment.Doctor.Id
                })
                .ToListAsync();

        }

        public async Task<AppointmentResponseDto?> UpdateStatusAsync(int id, string status)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (appointment == null) return null;

            appointment.Status = status;
            appointment.UpdatedAt = DateTime.UtcNow;

            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();

            return new AppointmentResponseDto
            {
                Id = appointment.Id,
                AppointmentDate = appointment.AppointmentDate,
                Status = appointment.Status,
                Notes = appointment.Notes,
                DoctorName = appointment.Doctor.User.FullName,
                PatientName = appointment.Patient.User.FullName,
                PatientId = appointment.Patient.Id,
                DoctorId = appointment.Doctor.Id
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return false;

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}