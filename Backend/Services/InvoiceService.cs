
using Backend.Interfaces;
using Backend.Models;
using Backend.Data;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;


namespace Backend.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly AppDbContext _context;

        public InvoiceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<InvoiceResponseDto> CreateAsync(CreateInvoiceDto dto)
        {
            var patient = await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == dto.PatientId);
            if (patient == null) throw new Exception("Patient not found");

            var appointment = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId);
            if (appointment == null) throw new Exception("Appointment not found");

            var invoice = new Invoice
            {
                PatientId = dto.PatientId,
                AppointmentId = dto.AppointmentId,
                Status = "Unpaid"
            };

            // Consultation Fee
            invoice.InvoiceItems.Add(new InvoiceItem
            {
                Description = $"Consultation with Dr. {appointment.Doctor.User.FullName}",
                Type = "Consultation",
                Amount = appointment.Doctor.ConsultationFee
            });

            // Dispensed Prescriptions
            var prescriptions = await _context.Prescriptions
                .Include(p => p.PrescriptionItems).ThenInclude(pi => pi.Medicine)
                .Where(p => p.PatientId == dto.PatientId && 
                            p.AppointmentId == dto.AppointmentId && 
                            p.Status == "Dispensed")
                .ToListAsync();

            foreach (var prescription in prescriptions)
            {
                foreach (var item in prescription.PrescriptionItems)
                {
                    invoice.InvoiceItems.Add(new InvoiceItem
                    {
                        Description = $"{item.Medicine.Name} x{item.Quantity}",
                        Type = "Pharmacy",
                        Amount = item.Medicine.Price * item.Quantity
                    });
                }
            }

            // Completed Lab Orders
            var labOrders = await _context.LabOrders
                .Include(lo => lo.LabTest)
                .Where(lo => lo.PatientId == dto.PatientId && 
                            lo.AppointmentId == dto.AppointmentId && 
                            lo.Status == "Completed")
                .ToListAsync();

            foreach (var labOrder in labOrders)
            {
                invoice.InvoiceItems.Add(new InvoiceItem
                {
                    Description = labOrder.LabTest.Name,
                    Type = "Lab",
                    Amount = labOrder.LabTest.Price
                });
            }

            invoice.TotalAmount = invoice.InvoiceItems.Sum(ii => ii.Amount);

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return new InvoiceResponseDto
            {
                Id = invoice.Id,
                PatientName = patient.User.FullName,
                DoctorName = appointment.Doctor.User.FullName,
                TotalAmount = invoice.TotalAmount,
                Status = invoice.Status,
                CreatedAt = invoice.CreatedAt,
                Items = invoice.InvoiceItems.Select(ii => new InvoiceItemResponseDto
                {
                    Id = ii.Id,
                    Description = ii.Description,
                    Type = ii.Type,
                    Amount = ii.Amount
                }).ToList()
            };
        }

        public async Task<IEnumerable<InvoiceResponseDto>> GetByPatientIdAsync(int patientId, int userId, string role, int page, int pageSize)
        {
            var query = _context.Invoices
                .Include(i => i.Appointment).ThenInclude(a => a.Doctor).ThenInclude(d => d.User)
                .Include(i => i.Patient).ThenInclude(p => p.User)
                .Include(i => i.InvoiceItems)
                .Where(i => i.PatientId == patientId)
                .AsQueryable();
            
            if (role == "Patient")
            {
                query = query.Where(i => i.PatientId == patientId);
            }

                return await _context.Invoices
                    .Where(i => i.PatientId == patientId)
                    .Include(i => i.Appointment).ThenInclude(a => a.Doctor).ThenInclude(d => d.User)
                    .Include(i => i.Patient).ThenInclude(p => p.User)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(invoice => new InvoiceResponseDto
                {
                    Id = invoice.Id,
                    PatientName = invoice.Patient.User.FullName,
                    DoctorName = invoice.Appointment.Doctor.User.FullName,
                    TotalAmount = invoice.TotalAmount,
                    Status = invoice.Status,
                    CreatedAt = invoice.CreatedAt,
                    Items = invoice.InvoiceItems.Select(ii => new InvoiceItemResponseDto
                    {
                        Id = ii.Id,
                        Description = ii.Description,
                        Type = ii.Type,
                        Amount = ii.Amount
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<InvoiceResponseDto>> GetMyInvoices(int patientId, int page, int pageSize, string? search, string? status)
         {
             var query = _context.Invoices
                 .Include(i => i.Appointment).ThenInclude(a => a.Doctor).ThenInclude(d => d.User)
                 .Include(i => i.Patient).ThenInclude(p => p.User)
                 .Where(i => i.PatientId == patientId)
                 .AsQueryable();

             if (!string.IsNullOrEmpty(search))
             {
                 query = query.Where(i => i.Patient.User.FullName.Contains(search) || i.Appointment.Doctor.User.FullName.Contains(search));
             }

             if (!string.IsNullOrEmpty(status))
             {
                 query = query.Where(i => i.Status == status);
             }

             return await query
                 .Skip((page - 1) * pageSize)
                 .Take(pageSize)
                 .Select(invoice => new InvoiceResponseDto
                 {
                     Id = invoice.Id,
                     PatientName = invoice.Patient.User.FullName,
                     DoctorName = invoice.Appointment.Doctor.User.FullName,
                     TotalAmount = invoice.TotalAmount,
                     Status = invoice.Status,
                     CreatedAt = invoice.CreatedAt,
                     Items = invoice.InvoiceItems.Select(ii => new InvoiceItemResponseDto
                     {
                         Id = ii.Id,
                         Description = ii.Description,
                         Type = ii.Type,
                         Amount = ii.Amount
                     }).ToList()
                 })
                 .ToListAsync();
            }

        public async Task<IEnumerable<InvoiceResponseDto>> GetAllAsync(int page, int pageSize, string? search, string? status)
        {
            var query = _context.Invoices
                .Include(i => i.Appointment).ThenInclude(a => a.Doctor).ThenInclude(d => d.User)
                .Include(i => i.Patient).ThenInclude(p => p.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(i => i.Patient.User.FullName.Contains(search) || i.Appointment.Doctor.User.FullName.Contains(search));
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(i => i.Status == status);
            }

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(invoice => new InvoiceResponseDto
                {
                    Id = invoice.Id,
                    PatientName = invoice.Patient.User.FullName,
                    DoctorName = invoice.Appointment.Doctor.User.FullName,
                    TotalAmount = invoice.TotalAmount,
                    Status = invoice.Status,
                    CreatedAt = invoice.CreatedAt,
                    Items = invoice.InvoiceItems.Select(ii => new InvoiceItemResponseDto
                    {
                        Id = ii.Id,
                        Description = ii.Description,
                        Type = ii.Type,
                        Amount = ii.Amount
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<InvoiceResponseDto?> GetByIdAsync(int id)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Appointment).ThenInclude(a => a.Doctor).ThenInclude(d => d.User)
                .Include(i => i.Patient).ThenInclude(p => p.User)
                .Include(i => i.InvoiceItems)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invoice == null) return null;

            return new InvoiceResponseDto
            {
                Id = invoice.Id,
                PatientName = invoice.Patient.User.FullName,
                DoctorName = invoice.Appointment.Doctor.User.FullName,
                TotalAmount = invoice.TotalAmount,
                Status = invoice.Status,
                CreatedAt = invoice.CreatedAt,
                Items = invoice.InvoiceItems.Select(ii => new InvoiceItemResponseDto
                {
                    Id = ii.Id,
                    Description = ii.Description,
                    Type = ii.Type,
                    Amount = ii.Amount
                }).ToList()
            };
        }

        public async Task<bool> MarkAsPaidAsync(int id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return false;

            invoice.Status = "Paid";
            await _context.SaveChangesAsync();
            return true; 
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return false;

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();
            return true;
        
        }

        public async Task<bool> UpdateAsync(int id, string status)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return false;

            invoice.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        

    }
}