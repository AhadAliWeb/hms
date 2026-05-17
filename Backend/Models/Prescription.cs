// Models/Prescription.cs
namespace Backend.Models
{
    public class Prescription
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public int AppointmentId { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Dispensed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DispensedAt { get; set; }

        // Navigation
        public Patient Patient { get; set; } = null!;
        public Doctor Doctor { get; set; } = null!;
        public Appointment Appointment { get; set; } = null!;
        public ICollection<PrescriptionItem> PrescriptionItems { get; set; } = new List<PrescriptionItem>();
    }
}