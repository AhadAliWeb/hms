namespace Backend.DTOs
{
    public class CreatePrescriptionItemDto
    {
        public int MedicineId { get; set; }
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public int Quantity { get; set; }
    }
}