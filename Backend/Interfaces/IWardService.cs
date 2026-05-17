using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IWardService
    {
        Task<WardResponseDto> CreateAsync(CreateWardDto dto);
        Task<IEnumerable<WardResponseDto>> GetAllAsync(int page, int pageSize);
        Task<WardResponseDto?> GetByIdAsync(int id);
        Task<bool> UpdateAsync(int id, CreateWardDto dto);
        Task<bool> DeleteAsync(int id);
    }
}