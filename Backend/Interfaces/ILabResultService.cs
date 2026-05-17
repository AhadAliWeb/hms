using Backend.DTOs;

namespace Backend.Interfaces

{
    public interface ILabResultService
    {
        Task<LabResultResponseDto> CreateAsync(int technicianId, CreateLabResultDto dto);
        Task<IEnumerable<LabResultResponseDto>> GetAllAsync(int page, int pageSize);
        Task<LabResultResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<LabResultResponseDto>> GetByLabOrderIdAsync(int labOrderId, int page, int pageSize);

        Task<IEnumerable<LabResultResponseDto>> GetByTechnicianIdAsync(int technicianId, int page, int pageSize);

        Task<IEnumerable<LabResultResponseDto>> GetByPatientIdAsync(int patientId, int userId, string userRole, int page, int pageSize);
        Task<IEnumerable<LabResultResponseDto>> GetByDoctorIdAsync(int doctorId, int page, int pageSize);
        Task<bool> UpdateAsync(int id, CreateLabResultDto dto);
        Task<bool> DeleteAsync(int id);
    }
}