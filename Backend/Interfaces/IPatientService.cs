// Interfaces/IPatientService.cs
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IPatientService
    {
        Task<PatientResponseDto> CreateAsync(CreatePatientDto dto);
        Task<PatientResponseDto?> GetByIdAsync(int id, int userId, string role);
        Task<IEnumerable<PatientResponseDto>> GetAllAsync(int page, int pageSize, string? search);
        Task<PatientResponseDto?> UpdateAsync(int id, CreatePatientDto dto);
        Task<bool> DeleteAsync(int id);
    }
}