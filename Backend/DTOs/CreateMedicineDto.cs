

namespace Backend.DTOs
{
    public class CreateMedicineDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public string Unit { get; set; } = string.Empty; // mg, ml, tablet
        public decimal Price { get; set; }

        public int StockQuantity { get; set; }

        public int LowStockThreshold { get; set; } = 10;
    }
}

