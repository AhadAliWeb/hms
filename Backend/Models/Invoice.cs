// Models/Invoice.cs
namespace Backend.Models
{
    public class Invoice
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int AppointmentId { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Unpaid"; // Unpaid, Paid
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }

        // Navigation
        public Patient Patient { get; set; } = null!;
        public Appointment Appointment { get; set; } = null!;
        public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
    }
}   