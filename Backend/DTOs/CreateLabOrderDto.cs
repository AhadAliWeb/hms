

namespace Backend.DTOs
{
    public class CreateLabOrderDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public int LabTestId { get; set; }
        public int AppointmentId { get; set; }

        public string Status { get; set; } = "Pending";

        public string? Notes { get; set; }
    }
}