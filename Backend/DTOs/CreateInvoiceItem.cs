

namespace Backend.DTOs
{
    public class CreateInvoiceItemDto
    {
        public string Description { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty; // Consultation, Pharmacy, Lab
        public decimal Amount { get; set; }
    }
}