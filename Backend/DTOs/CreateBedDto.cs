// DTOs/CreateBedDto.cs
namespace Backend.DTOs
{
    public class CreateBedDto
    {
        public int WardId { get; set; }
        public string BedNumber { get; set; } = string.Empty;

    }
}