using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IAdmissionService
    {
        Task<AdmissionResponseDto> CreateAsync(CreateAdmissionDto dto);
        Task<IEnumerable<AdmissionResponseDto>> GetAllAsync(int page, int pageSize);
        Task<AdmissionResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<AdmissionResponseDto>> GetByPatientIdAsync(int patientId, int userId, string userRole, int page, int pageSize);
        Task<IEnumerable<AdmissionResponseDto>> GetByDoctorIdAsync(int doctorId, int page, int pageSize);

        Task<IEnumerable<AdmissionResponseDto>> SearchAsync(string query, int page, int pageSize);

        Task<IEnumerable<AdmissionResponseDto>> GetByWardIdAsync(int wardId, int page, int pageSize);

        Task<bool> DischargeAsync(int id);
    }
}