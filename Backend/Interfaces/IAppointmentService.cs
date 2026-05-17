// Interfaces/IAppointmentService.cs
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IAppointmentService
    {
        Task<AppointmentResponseDto> CreateAsync(CreateAppointmentDto dto);
        Task<AppointmentResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<AppointmentResponseDto>> GetAllAsync(int page, int pageSize, string? search, string? status);
        Task<IEnumerable<AppointmentResponseDto>> GetByPatientIdAsync(int patientId, int page, int pageSize, string? search, string? status);
        Task<IEnumerable<AppointmentResponseDto?>> GetByDoctorIdAsync(int doctorId, int page, int pageSize);
        Task<AppointmentResponseDto?> UpdateStatusAsync(int id, string status);
        Task<bool> DeleteAsync(int id);
    }
}