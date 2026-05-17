// Models/LabOrder.cs
namespace Backend.Models
{
    public class LabOrder
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public int LabTestId { get; set; }
        public int AppointmentId { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Patient Patient { get; set; } = null!;
        public Doctor Doctor { get; set; } = null!;
        public LabTest LabTest { get; set; } = null!;
        public Appointment Appointment { get; set; } = null!;
        public LabResult? LabResult { get; set; }
    }
}