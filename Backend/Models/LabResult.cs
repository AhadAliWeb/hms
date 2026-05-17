// Models/LabResult.cs
namespace Backend.Models
{
    public class LabResult
    {
        public int Id { get; set; }
        public int LabOrderId { get; set; }
        public int TechnicianId { get; set; }
        public string Result { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime ResultDate { get; set; } = DateTime.UtcNow;

        // Navigation
        public LabOrder LabOrder { get; set; } = null!;
        public User Technician { get; set; } = null!;
    }
}