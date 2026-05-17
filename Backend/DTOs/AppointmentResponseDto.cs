


namespace Backend.DTOs
{
    public class AppointmentResponseDto
    {
        public int Id { get; set; }

        public int PatientId { get; set; }

        public int DoctorId { get; set; }

        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = string.Empty;

        public string? Notes { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
    }
}