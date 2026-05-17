public interface IDashboardService
{
    Task<AdminDashboardDto> GetAdminDashboardAsync();
    Task<DoctorDashboardDto> GetDoctorDashboardAsync(int doctorId);
    Task<AccountantDashboardDto> GetAccountantDashboardAsync();
    Task<NurseDashboardDto> GetNurseDashboardAsync();
}