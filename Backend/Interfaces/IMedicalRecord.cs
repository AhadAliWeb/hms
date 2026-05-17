// Interfaces/IMedicalRecordService.cs
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IMedicalRecordService
    {
        Task<MedicalRecordResponseDto> CreateAsync(CreateMedicalRecordDto dto);
        Task<MedicalRecordResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<MedicalRecordResponseDto>> GetByPatientIdAsync(int patientId, int page, int pageSize);
        Task<IEnumerable<MedicalRecordResponseDto>> GetByDoctorIdAsync(int doctorId, int page, int pageSize);
        Task<bool> DeleteAsync(int id);
    }
}