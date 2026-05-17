// Models/Bed.cs
namespace Backend.Models
{
    public class Bed
    {
        public int Id { get; set; }
        public int WardId { get; set; }
        public string BedNumber { get; set; } = string.Empty;
        public bool IsOccupied { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Ward Ward { get; set; } = null!;
        public Admission? Admission { get; set; }
    }
}