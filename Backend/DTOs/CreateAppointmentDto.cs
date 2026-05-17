


namespace Backend.DTOs
{
    public class CreateAppointmentDto
    {
        public int DoctorId { get; set; }
        public int PatientId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? Notes { get; set; }

    }
}