// DTOs/AdmissionResponseDto.cs
namespace Backend.DTOs
{
    public class AdmissionResponseDto
    {
        public int Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string BedNumber { get; set; } = string.Empty;
        public string WardName { get; set; } = string.Empty;
        public DateTime AdmissionDate { get; set; }
        public DateTime? DischargeDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}