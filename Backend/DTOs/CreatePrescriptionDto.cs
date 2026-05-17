

namespace Backend.DTOs
{
    public class CreatePrescriptionDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public int AppointmentId { get; set; }
        public List<CreatePrescriptionItemDto> Items { get; set; } = new();
    }
}