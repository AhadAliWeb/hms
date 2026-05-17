public class AdminDashboardDto
{
    public int TotalPatients { get; set; }
    public int TotalDoctors { get; set; }
    public int TodayAppointments { get; set; }
    public int AvailableBeds { get; set; }
    public int LowStockMedicines { get; set; }
    public decimal TodayRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
}