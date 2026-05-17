

namespace Backend.DTOs
{
    public class CreatePatientDto
    {

        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string BloodGroup { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }
        public string EmergencyContact { get; set; } = string.Empty;

    }
}

