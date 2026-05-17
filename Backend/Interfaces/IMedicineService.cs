using Backend.DTOs;


namespace Backend.Interfaces
{
    public interface IMedicineService
    {
        Task<MedicineResponseDto> CreateAsync(CreateMedicineDto dto);
        Task<IEnumerable<MedicineResponseDto>> GetAllAsync(int page, int pageSize, string? search);
        Task<MedicineResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<MedicineResponseDto>> GetLowStockAsync();

        Task UpdateAsync(int id, CreateMedicineDto dto);
        Task DeleteAsync(int id);
    }
}