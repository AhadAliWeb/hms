using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IPrescriptionService
    {
        Task<PrescriptionResponseDto> CreateAsync(CreatePrescriptionDto dto);
        Task<IEnumerable<PrescriptionResponseDto>> GetAllAsync(int page, int pageSize, string? search = null, string? status = null);

        Task<IEnumerable<PrescriptionResponseDto>> GetMyPrescriptionsAsync(int doctorId, int page, int pageSize);

        Task<IEnumerable<PrescriptionResponseDto>> GetMyPrescriptionsPatientAsync(int patientId, int page, int pageSize, string? search);
        Task<PrescriptionResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<PrescriptionResponseDto>> GetByPatientIdAsync(int patientId, int userId, string userRole, int page, int pageSize);
        Task<IEnumerable<PrescriptionResponseDto>> GetByDoctorIdAsync(int doctorId, int page, int pageSize);

        Task<bool> DispenseAsync(int id);

        Task UpdateAsync(int id, CreatePrescriptionDto dto);
        Task DeleteAsync(int id);
    }
}