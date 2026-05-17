// DTOs/CreateAdmissionDto.cs
namespace Backend.DTOs
{
    public class CreateAdmissionDto
    {
        public int PatientId { get; set; }
        public int BedId { get; set; }
        public int DoctorId { get; set; }
        public string? Notes { get; set; }
    }
}