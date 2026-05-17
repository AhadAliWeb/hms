// DTOs/BedResponseDto.cs
namespace Backend.DTOs
{
    public class BedResponseDto
    {
        public int Id { get; set; }
        public string BedNumber { get; set; } = string.Empty;
        public string WardName { get; set; } = string.Empty;
        public bool IsOccupied { get; set; }
    }
}