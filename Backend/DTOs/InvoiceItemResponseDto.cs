

namespace Backend.DTOs
{
    public class InvoiceItemResponseDto
    {
        public int Id { get; set; }

        
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Consultation, Pharmacy,

        public decimal Amount { get; set; }

    }
}