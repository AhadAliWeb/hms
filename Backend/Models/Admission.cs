// Models/Admission.cs
namespace Backend.Models
{
    public class Admission
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int BedId { get; set; }
        public int DoctorId { get; set; }
        public DateTime AdmissionDate { get; set; } = DateTime.UtcNow;
        public DateTime? DischargeDate { get; set; }
        public string Status { get; set; } = "Admitted"; // Admitted, Discharged
        public string? Notes { get; set; }

        // Navigation
        public Patient Patient { get; set; } = null!;
        public Bed Bed { get; set; } = null!;
        public Doctor Doctor { get; set; } = null!;
    }
}