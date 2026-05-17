// DTOs/WardResponseDto.cs
namespace Backend.DTOs
{
    public class WardResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int TotalBeds { get; set; }
        public int AvailableBeds { get; set; }
    }
}