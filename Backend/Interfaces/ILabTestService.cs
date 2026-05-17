using Backend.DTOs;


namespace Backend.Interfaces

{
    public interface ILabTestService
    {
        Task<LabTestResponseDto> CreateAsync(CreateLabTestDto dto);
        Task<IEnumerable<LabTestResponseDto>> GetAllAsync(int page, int pageSize);
        Task<LabTestResponseDto?> GetByIdAsync(int id);
        Task<bool> UpdateAsync(int id, CreateLabTestDto dto);
        Task<bool> DeleteAsync(int id);
    }
}