using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IBedService
    {
        Task<BedResponseDto> CreateAsync(CreateBedDto dto);
        Task<IEnumerable<BedResponseDto>> GetAllAsync(int page, int pageSize);
        Task<BedResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<BedResponseDto>> GetAvailableByWardAsync(int wardId, int page, int pageSize);

        Task<IEnumerable<BedResponseDto>> GetAllByWardAsync(int wardId, int page, int pageSize);


        
        Task<bool> UpdateAsync(int id, CreateBedDto dto);
        Task<bool> DeleteAsync(int id);
    }
}