// DTOs/PrescriptionResponseDto.cs
namespace Backend.DTOs
{
    public class PrescriptionResponseDto
    {
        public int Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? DispensedAt { get; set; }
        public List<PrescriptionItemResponseDto> Items { get; set; } = new();
    }
}