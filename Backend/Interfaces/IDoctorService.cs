// Interfaces/IDoctorService.cs
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IDoctorService
    {
        Task<DoctorResponseDto> CreateAsync(CreateDoctorDto dto);
        Task<DoctorResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<DoctorResponseDto>> GetAllAsync(int page, int pageSize, string? search);
        Task<DoctorResponseDto?> UpdateAsync(int id, CreateDoctorDto dto);
        Task<bool> DeleteAsync(int id);
    }
}