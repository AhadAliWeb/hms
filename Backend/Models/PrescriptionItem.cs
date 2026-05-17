// Models/PrescriptionItem.cs
namespace Backend.Models
{
    public class PrescriptionItem
    {
        public int Id { get; set; }
        public int PrescriptionId { get; set; }
        public int MedicineId { get; set; }
        public string Dosage { get; set; } = string.Empty; // e.g. 500mg
        public string Frequency { get; set; } = string.Empty; // e.g. Twice a day
        public int DurationDays { get; set; }
        public int Quantity { get; set; }

        // Navigation
        public Prescription Prescription { get; set; } = null!;
        public Medicine Medicine { get; set; } = null!;
    }
}