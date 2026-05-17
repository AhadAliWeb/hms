// DTOs/PrescriptionItemResponseDto.cs
namespace Backend.DTOs
{
    public class PrescriptionItemResponseDto
    {
        public int Id { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public int Quantity { get; set; }
    }
}