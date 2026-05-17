


namespace Backend.DTOs
{
    public class InvoiceResponseDto
    {
        public int Id { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string DoctorName { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<InvoiceItemResponseDto> Items { get; set; } = new List<InvoiceItemResponseDto>();
    }
}