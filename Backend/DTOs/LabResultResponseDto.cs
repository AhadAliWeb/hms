namespace Backend.DTOs
{
    public class LabResultResponseDto
    {
        public int Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string LabTestName { get; set; } = string.Empty;
        public string TechnicianName { get; set; } = string.Empty;
        public string Result { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime ResultDate { get; set; }
    }
}