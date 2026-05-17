

namespace Backend.DTOs
{

    public class MedicalRecordResponseDto
    {
        public int Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string Diagnosis { get; set; } = string.Empty;
        public string Prescription { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public DateTime RecordDate { get; set; }
    }
}