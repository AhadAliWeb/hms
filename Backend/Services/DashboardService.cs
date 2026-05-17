using Backend.Data;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;
        private readonly IWardService _wardService;

        public DashboardService(AppDbContext context, IWardService wardService)
        {
            _context = context;
            _wardService = wardService;
        }

        public async Task<AdminDashboardDto> GetAdminDashboardAsync()
        {
            var today = DateTime.UtcNow.Date;

            return new AdminDashboardDto
            {
                TotalPatients = await _context.Patients.CountAsync(),
                TotalDoctors = await _context.Doctors.CountAsync(),
                TodayAppointments = await _context.Appointments
                    .CountAsync(a => a.AppointmentDate.Date == today),
                AvailableBeds = await _context.Beds
                    .CountAsync(b => !b.IsOccupied),
                LowStockMedicines = await _context.Medicines
                    .CountAsync(m => m.StockQuantity <= m.LowStockThreshold),
                TodayRevenue = await _context.Invoices
                    .Where(i => i.Status == "Paid" && i.PaidAt.HasValue && i.PaidAt.Value.Date == today)
                    .SumAsync(i => i.TotalAmount),
                MonthlyRevenue = await _context.Invoices
                    .Where(i => i.Status == "Paid" && i.PaidAt.HasValue && 
                           i.PaidAt.Value.Month == today.Month && 
                           i.PaidAt.Value.Year == today.Year)
                    .SumAsync(i => i.TotalAmount)
            };
        }

        public async Task<DoctorDashboardDto> GetDoctorDashboardAsync(int doctorId)
        {
            var today = DateTime.UtcNow.Date;

            return new DoctorDashboardDto
            {
                TodayAppointments = await _context.Appointments
                    .CountAsync(a => a.DoctorId == doctorId && a.AppointmentDate.Date == today),
                PendingLabOrders = await _context.LabOrders
                    .CountAsync(lo => lo.DoctorId == doctorId && lo.Status == "Pending"),
                PendingPrescriptions = await _context.Prescriptions
                    .CountAsync(p => p.DoctorId == doctorId && p.Status == "Pending")
            };
        }

        public async Task<AccountantDashboardDto> GetAccountantDashboardAsync()
        {
            var invoices = await _context.Invoices.ToListAsync();

            return new AccountantDashboardDto
            {
                TotalRevenue = invoices.Sum(i => i.TotalAmount),
                PaidRevenue = invoices.Where(i => i.Status == "Paid").Sum(i => i.TotalAmount),
                UnpaidRevenue = invoices.Where(i => i.Status == "Unpaid").Sum(i => i.TotalAmount),
                TotalInvoices = invoices.Count,
                PaidInvoices = invoices.Count(i => i.Status == "Paid"),
                UnpaidInvoices = invoices.Count(i => i.Status == "Unpaid")
            };
        }

        public async Task<NurseDashboardDto> GetNurseDashboardAsync()
        {
            return new NurseDashboardDto
            {
                TotalAdmittedPatients = await _context.Admissions
                    .CountAsync(a => a.Status == "Admitted"),
                TotalBeds = await _context.Beds.CountAsync(),
                AvailableBeds = await _context.Beds
                    .CountAsync(b => !b.IsOccupied),
                
                Wards = _wardService.GetAllAsync(1, 10).Result.ToList()
            };
        }
    }
}