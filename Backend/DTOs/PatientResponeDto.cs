

namespace Backend.DTOs
{
    public class PatientResponseDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string BloodGroup { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string EmergencyContact { get; set; } = string.Empty;
    }
}