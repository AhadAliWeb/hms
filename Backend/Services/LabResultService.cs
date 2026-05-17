using Backend.Data;
using Backend.Models;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace Backend.Services
{
    public class LabResultService: ILabResultService
    {
        
        private readonly AppDbContext _context;
        public LabResultService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<LabResultResponseDto> CreateAsync(int technicianId, CreateLabResultDto dto)
        {
            var labOrder = await _context.LabOrders.Include(l => l.LabTest).FirstOrDefaultAsync(l => l.Id == dto.LabOrderId);
            if (labOrder == null) throw new Exception("Lab order not found");

            var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == labOrder.PatientId);
            if (patient == null) throw new Exception("Patient not found");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == technicianId && u.Role == "LabTechnician");
            if (user == null) throw new Exception("Technician not found");


            var labResult = new LabResult
            {
                LabOrderId = dto.LabOrderId,
                TechnicianId = technicianId,
                Result = dto.Result,
                Notes = dto.Notes
            };

            await _context.LabResults.AddAsync(labResult);
            await _context.SaveChangesAsync();

            return new LabResultResponseDto
            {
                Id = labResult.Id,
                PatientName = patient.User.FullName,
                LabTestName = labOrder.LabTest.Name,
                TechnicianName = user.FullName,
                Result = labResult.Result,
                Notes = labResult.Notes,
                ResultDate = labResult.ResultDate
            };
        }

        public async Task<IEnumerable<LabResultResponseDto>> GetAllAsync(int page, int pageSize)
        {
            return await _context.LabResults
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.Patient).ThenInclude(p => p.User)
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.LabTest)
                .Include(lr => lr.Technician)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(lr => new LabResultResponseDto
                {
                    Id = lr.Id,
                    PatientName = lr.LabOrder.Patient.User.FullName,
                    LabTestName = lr.LabOrder.LabTest.Name,
                    TechnicianName = lr.Technician.FullName,
                    Result = lr.Result,
                    Notes = lr.Notes,
                    ResultDate = lr.ResultDate
                })
                .ToListAsync();
        }

        public async Task<LabResultResponseDto?> GetByIdAsync(int id)
        {
            var labResult = await _context.LabResults
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.Patient).ThenInclude(p => p.User)
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.LabTest)
                .Include(lr => lr.Technician)
                .FirstOrDefaultAsync(lr => lr.Id == id);

            if (labResult == null) return null;

            return new LabResultResponseDto
            {
                Id = labResult.Id,
                PatientName = labResult.LabOrder.Patient.User.FullName,
                LabTestName = labResult.LabOrder.LabTest.Name,
                TechnicianName = labResult.Technician.FullName,
                Result = labResult.Result,
                Notes = labResult.Notes,
                ResultDate = labResult.ResultDate
            };
        }

        public async Task<IEnumerable<LabResultResponseDto>> GetByLabOrderIdAsync(int labOrderId, int page, int pageSize)
        {
            return await _context.LabResults
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.Patient).ThenInclude(p => p.User)
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.LabTest)
                .Include(lr => lr.Technician)
                .Where(lr => lr.LabOrderId == labOrderId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(lr => new LabResultResponseDto
                {
                    Id = lr.Id,
                    PatientName = lr.LabOrder.Patient.User.FullName,
                    LabTestName = lr.LabOrder.LabTest.Name,
                    TechnicianName = lr.Technician.FullName,
                    Result = lr.Result,
                    Notes = lr.Notes,
                    ResultDate = lr.ResultDate
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<LabResultResponseDto>> GetByTechnicianIdAsync(int technicianId, int page, int pageSize)
        {
            return await _context.LabResults
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.Patient).ThenInclude(p => p.User)
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.LabTest)
                .Include(lr => lr.Technician)
                .Where(lr => lr.TechnicianId == technicianId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(lr => new LabResultResponseDto
                {
                    Id = lr.Id,
                    PatientName = lr.LabOrder.Patient.User.FullName,
                    LabTestName = lr.LabOrder.LabTest.Name,
                    TechnicianName = lr.Technician.FullName,
                    Result = lr.Result,
                    Notes = lr.Notes,
                    ResultDate = lr.ResultDate
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<LabResultResponseDto>> GetByDoctorIdAsync(int doctorId, int page, int pageSize)
        {
            return await _context.LabResults
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.Patient).ThenInclude(p => p.User)
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.LabTest)
                .Include(lr => lr.Technician)
                .Where(lr => lr.LabOrder.DoctorId == doctorId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(lr => new LabResultResponseDto
                {
                    Id = lr.Id,
                    PatientName = lr.LabOrder.Patient.User.FullName,
                    LabTestName = lr.LabOrder.LabTest.Name,
                    TechnicianName = lr.Technician.FullName,
                    Result = lr.Result,
                    Notes = lr.Notes,
                    ResultDate = lr.ResultDate
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<LabResultResponseDto>> GetByPatientIdAsync(int patientId, int userId, string userRole, int page, int pageSize)
        {
            var query = _context.LabResults
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.Patient).ThenInclude(p => p.User)
                .Include(lr => lr.LabOrder).ThenInclude(lo => lo.LabTest)
                .Include(lr => lr.Technician)
                .Where(lr => lr.LabOrder.PatientId == patientId)
                .AsQueryable();

            if (userRole == "Patient")
                query = query.Where(lr => lr.LabOrder.Patient.UserId == userId);
            
            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(lr => new LabResultResponseDto
                {
                    Id = lr.Id,
                    PatientName = lr.LabOrder.Patient.User.FullName,
                    LabTestName = lr.LabOrder.LabTest.Name,
                    TechnicianName = lr.Technician.FullName,
                    Result = lr.Result,
                    Notes = lr.Notes,
                    ResultDate = lr.ResultDate
                })
                .ToListAsync();
        }   

        public async Task<bool> UpdateAsync(int id, CreateLabResultDto dto)
        {
            var labResult = await _context.LabResults.FindAsync(id);
            if (labResult == null) return false;

            labResult.Result = dto.Result;
            labResult.Notes = dto.Notes;
            labResult.ResultDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var labResult = await _context.LabResults.FindAsync(id);
            if (labResult == null) return false;

            _context.LabResults.Remove(labResult);
            await _context.SaveChangesAsync();
            return true;

        }



    }

}