// Models/LabTest.cs
namespace Backend.Models
{
    public class LabTest
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<LabOrder> LabOrders { get; set; } = new List<LabOrder>();
    }
}