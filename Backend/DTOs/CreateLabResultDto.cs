

namespace Backend.DTOs
{
    public class CreateLabResultDto
    {
        public int LabOrderId { get; set; }
        public string Result { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}