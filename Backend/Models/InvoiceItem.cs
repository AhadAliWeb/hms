// Models/InvoiceItem.cs
namespace Backend.Models
{
    public class InvoiceItem
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public string Description { get; set; } = string.Empty; // Consultation, Medicine, Lab Test
        public string Type { get; set; } = string.Empty; // Consultation, Pharmacy, Lab
        public decimal Amount { get; set; }

        // Navigation
        public Invoice Invoice { get; set; } = null!;
    }
}