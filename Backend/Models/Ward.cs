// Models/Ward.cs
namespace Backend.Models
{
    public class Ward
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // General, ICU, Private
        public int TotalBeds { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<Bed> Beds { get; set; } = new List<Bed>();
    }
}