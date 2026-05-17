using Backend.Data;
using Backend.Models;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace Backend.Services
{
    public class LabOrderService : ILabOrderService
    {
        private readonly AppDbContext _context;
        public LabOrderService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<LabOrderResponseDto> CreateAsync(CreateLabOrderDto dto)
        {
            var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == dto.PatientId);
            if (patient == null) throw new Exception("Patient not found");

            var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == dto.DoctorId);
            if (doctor == null) throw new Exception("Doctor not found");

            var labTest = await _context.LabTests.FindAsync(dto.LabTestId);
            if (labTest == null) throw new Exception("Lab test not found");

            var labOrder = new LabOrder
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                LabTestId = dto.LabTestId,
                AppointmentId = dto.AppointmentId,
                Status = "Pending",
                Notes = dto.Notes,
            };

            await _context.LabOrders.AddAsync(labOrder);
            await _context.SaveChangesAsync();

            return new LabOrderResponseDto
            {
                Id = labOrder.Id,
                PatientName = patient.User.FullName,
                DoctorName = doctor.User.FullName,
                LabTestName = labTest.Name,
                Status = labOrder.Status,
                Notes = labOrder.Notes
            };
        }

        public async Task<IEnumerable<LabOrderResponseDto>> GetAllAsync(int page, int pageSize)
        {
            return await _context.LabOrders
                .Include(lo => lo.Patient).ThenInclude(p => p.User)
                .Include(lo => lo.Doctor).ThenInclude(d => d.User)
                .Include(lo => lo.LabTest)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(lo => new LabOrderResponseDto
                {
                    Id = lo.Id,
                    PatientName = lo.Patient.User.FullName,
                    DoctorName = lo.Doctor.User.FullName,
                    LabTestName = lo.LabTest.Name,
                    Status = lo.Status,
                    Notes = lo.Notes,
                    CreatedAt = lo.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<LabOrderResponseDto?> GetByIdAsync(int id)
        {
            var labOrder = await _context.LabOrders
                .Include(lo => lo.Patient).ThenInclude(p => p.User)
                .Include(lo => lo.Doctor).ThenInclude(d => d.User)
                .Include(lo => lo.LabTest)
                .FirstOrDefaultAsync(lo => lo.Id == id);

            if (labOrder == null) return null;

            return new LabOrderResponseDto
            {
                Id = labOrder.Id,
                PatientName = labOrder.Patient.User.FullName,
                DoctorName = labOrder.Doctor.User.FullName,
                LabTestName = labOrder.LabTest.Name,
                Status = labOrder.Status,
                Notes = labOrder.Notes,
                CreatedAt = labOrder.CreatedAt
            };
        }

        public async Task<IEnumerable<LabOrderResponseDto>> GetByAppointmentIdAsync(int appointmentId)
        {
            return await _context.LabOrders
                .Where(lo => lo.AppointmentId == appointmentId)
                .Include(lo => lo.Patient).ThenInclude(p => p.User)
                .Include(lo => lo.Doctor).ThenInclude(d => d.User)
                .Include(lo => lo.LabTest)
                .Select(lo => new LabOrderResponseDto
                {
                    Id = lo.Id,
                    PatientName = lo.Patient.User.FullName,
                    DoctorName = lo.Doctor.User.FullName,
                    LabTestName = lo.LabTest.Name,
                    Status = lo.Status,
                    Notes = lo.Notes,
                    CreatedAt = lo.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<LabOrderResponseDto>> GetByPatientIdAsync(int patientId, int userId, string role, int page, int pageSize)
        {
            var query = _context.LabOrders
                .Where(lo => lo.PatientId == patientId)
                .Include(lo => lo.Patient).ThenInclude(p => p.User)
                .Include(lo => lo.Doctor).ThenInclude(d => d.User)
                .Include(lo => lo.LabTest).AsQueryable();
            
            if (role == "Patient")
                query = query.Where(lo => lo.Patient.UserId == userId);

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(lo => new LabOrderResponseDto
                {
                    Id = lo.Id,
                    PatientName = lo.Patient.User.FullName,
                    DoctorName = lo.Doctor.User.FullName,
                    LabTestName = lo.LabTest.Name,
                    Status = lo.Status,
                    Notes = lo.Notes,
                    CreatedAt = lo.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<LabOrderResponseDto>> GetByDoctorIdAsync(int doctorId, int page, int pageSize)
        {
            return await _context.LabOrders
                .Where(lo => lo.DoctorId == doctorId)
                .Include(lo => lo.Patient).ThenInclude(p => p.User)
                .Include(lo => lo.Doctor).ThenInclude(d => d.User)
                .Include(lo => lo.LabTest)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(lo => new LabOrderResponseDto
                {
                    Id = lo.Id,
                    PatientName = lo.Patient.User.FullName,
                    DoctorName = lo.Doctor.User.FullName,
                    LabTestName = lo.LabTest.Name,
                    Status = lo.Status,
                    Notes = lo.Notes,
                    CreatedAt = lo.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateAsync(int id, string status)
        {
            var labOrder = await _context.LabOrders.FindAsync(id);
            if (labOrder == null) return false;

            labOrder.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var labOrder = await _context.LabOrders.FindAsync(id);
            if (labOrder == null) return false;

            _context.LabOrders.Remove(labOrder);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}