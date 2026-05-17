namespace Backend.DTOs
{
    public class CreateWardDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int TotalBeds { get; set; }
    }
}