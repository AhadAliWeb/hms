

namespace Backend.DTOs
{
    public class LabOrderResponseDto
    {
        public int Id { get; set; }
        
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string LabTestName { get; set; } = string.Empty;
        
        public string Status { get; set; } = string.Empty;

        public string? Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}