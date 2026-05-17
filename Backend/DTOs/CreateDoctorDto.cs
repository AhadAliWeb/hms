

namespace Backend.DTOs
{
    public class CreateDoctorDto
    {

        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;

        public string Qualification { get; set; } = string.Empty;
        public int ExperienceYears { get; set; }
        public decimal ConsultationFee { get; set; }
    }
}