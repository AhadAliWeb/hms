using Backend.Interfaces;
using Backend.Models;
using Backend.Data;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;


namespace Backend.Services
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly AppDbContext _context;

        public PrescriptionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PrescriptionResponseDto> CreateAsync(CreatePrescriptionDto dto)
        {
            var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == dto.PatientId);
            if (patient == null) throw new Exception("Patient not found");
            var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.Id == dto.DoctorId);
            if (doctor == null) throw new Exception("Doctor not found");

            var prescription = new Prescription
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                AppointmentId = dto.AppointmentId,
            };

            foreach (var item in dto.Items)
            {
                var medicine = await _context.Medicines.FindAsync(item.MedicineId);
                if (medicine == null) throw new Exception($"Medicine {item.MedicineId} not found");

                prescription.PrescriptionItems.Add(new PrescriptionItem
                {
                    MedicineId = item.MedicineId,
                    Dosage = item.Dosage,
                    Frequency = item.Frequency,
                    DurationDays = item.DurationDays,
                    Quantity = item.Quantity
                });
            }

            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();

            return new PrescriptionResponseDto
            {
                Id = prescription.Id,
                PatientName = patient.User.FullName,
                DoctorName = doctor.User.FullName,
                Status = prescription.Status,
                CreatedAt = prescription.CreatedAt,
                Items = prescription.PrescriptionItems.Select(pi => new PrescriptionItemResponseDto
                {
                    Id = pi.Id,
                    MedicineName = _context.Medicines.Find(pi.MedicineId)!.Name,
                    Dosage = pi.Dosage,
                    Frequency = pi.Frequency,
                    DurationDays = pi.DurationDays,
                    Quantity = pi.Quantity
                }).ToList()
            };
        }

        public async Task<IEnumerable<PrescriptionResponseDto>> GetAllAsync(int page, int pageSize, string? search = null, string? status = null)
        {
            var query = _context.Prescriptions
                .Include(p => p.Patient).ThenInclude(p => p.User)
                .Include(p => p.Doctor).ThenInclude(d => d.User)
                .Include(p => p.PrescriptionItems).ThenInclude(pi => pi.Medicine).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p =>
                    p.Patient.User.FullName.Contains(search) ||
                    p.Doctor.User.FullName.Contains(search) ||
                    p.PrescriptionItems.Any(pi => pi.Medicine.Name.Contains(search)));
            }

            if (!string.IsNullOrEmpty(status))      
                query = query.Where(p => p.Status == status);



        

            return await query.OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PrescriptionResponseDto
                {
                    Id = p.Id,
                    PatientName = p.Patient.User.FullName,
                    DoctorName = p.Doctor.User.FullName,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    DispensedAt = p.DispensedAt,
                    Items = p.PrescriptionItems.Select(pi => new PrescriptionItemResponseDto
                    {
                        Id = pi.Id,
                        MedicineName = pi.Medicine.Name,
                        Dosage = pi.Dosage,
                        Frequency = pi.Frequency,
                        DurationDays = pi.DurationDays,
                        Quantity = pi.Quantity
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<PrescriptionResponseDto>> GetMyPrescriptionsAsync(int doctorId, int page, int pageSize)
        {
            return await _context.Prescriptions
                .Include(p => p.Patient).ThenInclude(p => p.User)
                .Include(p => p.Doctor).ThenInclude(d => d.User)
                .Include(p => p.PrescriptionItems).ThenInclude(pi => pi.Medicine)
                .Where(p => p.DoctorId == doctorId)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PrescriptionResponseDto
                {
                    Id = p.Id,
                    PatientName = p.Patient.User.FullName,
                    DoctorName = p.Doctor.User.FullName,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    DispensedAt = p.DispensedAt,
                    Items = p.PrescriptionItems.Select(pi => new PrescriptionItemResponseDto
                    {
                        Id = pi.Id,
                        MedicineName = pi.Medicine.Name,
                        Dosage = pi.Dosage,
                        Frequency = pi.Frequency,
                        DurationDays = pi.DurationDays,
                        Quantity = pi.Quantity
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<PrescriptionResponseDto>> GetMyPrescriptionsPatientAsync(int patientId, int page, int pageSize, string? search)
        {
            var query = _context.Prescriptions.Where(p => p.PatientId == patientId);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => 
                    p.Patient.User.FullName.Contains(search) ||
                    p.Doctor.User.FullName.Contains(search) ||
                    p.PrescriptionItems.Any(pi => pi.Medicine.Name.Contains(search)));
            }

            return await query.OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PrescriptionResponseDto
                {
                    Id = p.Id,
                    PatientName = p.Patient.User.FullName,
                    DoctorName = p.Doctor.User.FullName,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    DispensedAt = p.DispensedAt,
                    Items = p.PrescriptionItems.Select(pi => new PrescriptionItemResponseDto
                    {
                        Id = pi.Id,
                        MedicineName = pi.Medicine.Name,
                        Dosage = pi.Dosage,
                        Frequency = pi.Frequency,
                        DurationDays = pi.DurationDays,
                        Quantity = pi.Quantity
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<PrescriptionResponseDto?> GetByIdAsync(int id)
        {
            var prescription = await _context.Prescriptions
                .Include(p => p.Patient).ThenInclude(p => p.User)
                .Include(p => p.Doctor).ThenInclude(d => d.User)
                .Include(p => p.PrescriptionItems).ThenInclude(pi => pi.Medicine)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (prescription == null) return null;

            return new PrescriptionResponseDto
            {
                Id = prescription.Id,
                PatientName = prescription.Patient.User.FullName,
                DoctorName = prescription.Doctor.User.FullName,
                Status = prescription.Status,
                CreatedAt = prescription.CreatedAt,
                DispensedAt = prescription.DispensedAt,
                Items = prescription.PrescriptionItems.Select(pi => new PrescriptionItemResponseDto
                {
                    Id = pi.Id,
                    MedicineName = pi.Medicine.Name,
                    Dosage = pi.Dosage,
                    Frequency = pi.Frequency,
                    DurationDays = pi.DurationDays,
                    Quantity = pi.Quantity
                }).ToList()
            };
        }

        public async Task<IEnumerable<PrescriptionResponseDto>> GetByPatientIdAsync(int patientId, int userId, string userRole, int page, int pageSize)
        {
            var query = _context.Prescriptions.Where(p => p.PatientId == patientId);

            if (userRole == "Patient")
                query = query.Where(p => p.Patient.UserId == userId);

            return await query
                .Include(p => p.Patient).ThenInclude(p => p.User)
                .Include(p => p.Doctor).ThenInclude(d => d.User)
                .Include(p => p.PrescriptionItems).ThenInclude(pi => pi.Medicine)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PrescriptionResponseDto
                {
                    Id = p.Id,
                    PatientName = p.Patient.User.FullName,
                    DoctorName = p.Doctor.User.FullName,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    DispensedAt = p.DispensedAt,
                    Items = p.PrescriptionItems.Select(pi => new PrescriptionItemResponseDto
                    {
                        Id = pi.Id,
                        MedicineName = pi.Medicine.Name,
                        Dosage = pi.Dosage,
                        Frequency = pi.Frequency,
                        DurationDays = pi.DurationDays,
                        Quantity = pi.Quantity
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<PrescriptionResponseDto>> GetByDoctorIdAsync(int doctorId, int page, int pageSize)
        {
            return await _context.Prescriptions
                .Where(p => p.DoctorId == doctorId)
                .Include(p => p.Patient).ThenInclude(p => p.User)
                .Include(p => p.Doctor).ThenInclude(d => d.User)
                .Include(p => p.PrescriptionItems).ThenInclude(pi => pi.Medicine)
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PrescriptionResponseDto
                {
                    Id = p.Id,
                    PatientName = p.Patient.User.FullName,
                    DoctorName = p.Doctor.User.FullName,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    DispensedAt = p.DispensedAt,
                    Items = p.PrescriptionItems.Select(pi => new PrescriptionItemResponseDto
                    {
                        Id = pi.Id,
                        MedicineName = pi.Medicine.Name,
                        Dosage = pi.Dosage,
                        Frequency = pi.Frequency,
                        DurationDays = pi.DurationDays,
                        Quantity = pi.Quantity
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<bool> DispenseAsync(int id)
        {
            var prescription = await _context.Prescriptions
                .Include(p => p.PrescriptionItems)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (prescription == null) return false;
            if (prescription.Status == "Dispensed") throw new Exception("Prescription already dispensed");

            foreach (var item in prescription.PrescriptionItems)
            {
                var medicine = await _context.Medicines.FindAsync(item.MedicineId);
                if (medicine == null) throw new Exception($"Medicine {item.MedicineId} not found");
                if (medicine.StockQuantity < item.Quantity) throw new Exception($"Insufficient stock for {medicine.Name}");

                medicine.StockQuantity -= item.Quantity;
            }

            prescription.Status = "Dispensed";
            prescription.DispensedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task UpdateAsync(int id, CreatePrescriptionDto dto)
        {
            var prescription = await _context.Prescriptions
                .Include(p => p.PrescriptionItems)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (prescription == null) throw new Exception("Prescription not found");
            if (prescription.Status == "Dispensed") throw new Exception("Cannot update a dispensed prescription");

            _context.PrescriptionItems.RemoveRange(prescription.PrescriptionItems);

            foreach (var item in dto.Items)
            {
                var medicine = await _context.Medicines.FindAsync(item.MedicineId);
                if (medicine == null) throw new Exception($"Medicine {item.MedicineId} not found");

                prescription.PrescriptionItems.Add(new PrescriptionItem
                {
                    MedicineId = item.MedicineId,
                    Dosage = item.Dosage,
                    Frequency = item.Frequency,
                    DurationDays = item.DurationDays,
                    Quantity = item.Quantity,
                    Medicine = medicine
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var prescription = await _context.Prescriptions
                .Include(p => p.PrescriptionItems)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (prescription == null) throw new Exception("Prescription not found");
            if (prescription.Status == "Dispensed") throw new Exception("Cannot delete a dispensed prescription");

            _context.PrescriptionItems.RemoveRange(prescription.PrescriptionItems);
            _context.Prescriptions.Remove(prescription);
            await _context.SaveChangesAsync();
        }
    }
}