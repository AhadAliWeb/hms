using Backend.Interfaces;
using Backend.Models;
using Backend.Data;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class AdmissionService : IAdmissionService
    {
        private readonly AppDbContext _context;

        public AdmissionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<AdmissionResponseDto> CreateAsync(CreateAdmissionDto dto)
        {
            var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == dto.PatientId);
            if (patient == null) throw new Exception("Patient not found");

            var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == dto.DoctorId);
            if (doctor == null) throw new Exception("Doctor not found");

            var bed = await _context.Beds.Include(b => b.Ward).FirstOrDefaultAsync(b => b.Id == dto.BedId);
            if (bed == null) throw new Exception("Bed not found");
            if (bed.IsOccupied) throw new Exception("Bed is already occupied");

            var admission = new Admission
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                BedId = dto.BedId,
                AdmissionDate = DateTime.UtcNow,
                Notes = dto.Notes
            };

            bed.IsOccupied = true;

            _context.Admissions.Add(admission);
            await _context.SaveChangesAsync();

            return new AdmissionResponseDto
            {
                Id = admission.Id,
                PatientName = patient.User.FullName,
                DoctorName = doctor.User.FullName,
                WardName = bed.Ward.Name,
                BedNumber = bed.BedNumber,
                Status = admission.Status,
                AdmissionDate = admission.AdmissionDate,
                Notes = admission.Notes
            };
        }

        public async Task<AdmissionResponseDto?> GetByIdAsync(int id)
        {
            var admission = await _context.Admissions
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Bed).ThenInclude(b => b.Ward)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (admission == null) return null;

            return new AdmissionResponseDto
            {
                Id = admission.Id,
                PatientName = admission.Patient.User.FullName,
                DoctorName = admission.Doctor.User.FullName,
                WardName = admission.Bed.Ward.Name,
                BedNumber = admission.Bed.BedNumber,
                Status = admission.Status,
                AdmissionDate = admission.AdmissionDate,
                DischargeDate = admission.DischargeDate,
                Notes = admission.Notes
            };
        }

        public async Task<IEnumerable<AdmissionResponseDto>> GetAllAsync(int page, int pageSize)
        {
            return await _context.Admissions
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Bed).ThenInclude(b => b.Ward)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AdmissionResponseDto
                {
                    Id = a.Id,
                    PatientName = a.Patient.User.FullName,
                    DoctorName = a.Doctor.User.FullName,
                    WardName = a.Bed.Ward.Name,
                    BedNumber = a.Bed.BedNumber,
                    Status = a.Status,
                    AdmissionDate = a.AdmissionDate,
                    DischargeDate = a.DischargeDate,
                    Notes = a.Notes
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<AdmissionResponseDto>> GetByPatientIdAsync(int patientId, int userId, string userRole, int page, int pageSize)
        {
            var query = _context.Admissions
                .Where(a => a.PatientId == patientId);

            if (userRole == "Patient")
                query = query.Where(a => a.Patient.UserId == userId);

            return await query
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Bed).ThenInclude(b => b.Ward)
                .OrderByDescending(a => a.AdmissionDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AdmissionResponseDto
                {
                    Id = a.Id,
                    PatientName = a.Patient.User.FullName,
                    DoctorName = a.Doctor.User.FullName,
                    WardName = a.Bed.Ward.Name,
                    BedNumber = a.Bed.BedNumber,
                    Status = a.Status,
                    AdmissionDate = a.AdmissionDate,
                    DischargeDate = a.DischargeDate,
                    Notes = a.Notes
                })
                .ToListAsync();
        }
        public async Task<IEnumerable<AdmissionResponseDto>> GetByDoctorIdAsync(int doctorId, int page, int pageSize)
        {
            return await _context.Admissions
                .Where(a => a.DoctorId == doctorId)
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Bed).ThenInclude(b => b.Ward)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AdmissionResponseDto
                {
                    Id = a.Id,
                    PatientName = a.Patient.User.FullName,
                    DoctorName = a.Doctor.User.FullName,
                    WardName = a.Bed.Ward.Name,
                    BedNumber = a.Bed.BedNumber,
                    Status = a.Status,
                    AdmissionDate = a.AdmissionDate,
                    DischargeDate = a.DischargeDate,
                    Notes = a.Notes
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<AdmissionResponseDto>> SearchAsync(string query, int page, int pageSize)
        {
            return await _context.Admissions
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Bed).ThenInclude(b => b.Ward)
                .Where(a =>
                    a.Status == "Admitted" &&
                    (a.Patient.User.FullName.Contains(query) ||
                     a.Doctor.User.FullName.Contains(query) ||
                     a.Bed.Ward.Name.Contains(query) ||
                     a.Bed.BedNumber.Contains(query))
                )
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AdmissionResponseDto
                {
                    Id = a.Id,
                    PatientName = a.Patient.User.FullName,
                    DoctorName = a.Doctor.User.FullName,
                    WardName = a.Bed.Ward.Name,
                    BedNumber = a.Bed.BedNumber,
                    Status = a.Status,
                    AdmissionDate = a.AdmissionDate,
                    DischargeDate = a.DischargeDate,
                    Notes = a.Notes
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<AdmissionResponseDto>> GetByWardIdAsync(int wardId, int page, int pageSize)
        {
            return await _context.Admissions
                .Include(a => a.Patient).ThenInclude(p => p.User)
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Bed).ThenInclude(b => b.Ward)
                .Where(a => a.Bed.WardId == wardId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AdmissionResponseDto
                {
                    Id = a.Id,
                    PatientName = a.Patient.User.FullName,
                    DoctorName = a.Doctor.User.FullName,
                    WardName = a.Bed.Ward.Name,
                    BedNumber = a.Bed.BedNumber,
                    Status = a.Status,
                    AdmissionDate = a.AdmissionDate,
                    DischargeDate = a.DischargeDate,
                    Notes = a.Notes
                })
                .ToListAsync();
        }

        public async Task<bool> DischargeAsync(int id)
        {
            var admission = await _context.Admissions
                .Include(a => a.Bed)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (admission == null) return false;

            admission.Status = "Discharged";
            admission.DischargeDate = DateTime.UtcNow;
            admission.Bed.IsOccupied = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }    
}