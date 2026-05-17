using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface ILabOrderService
    {
        Task<LabOrderResponseDto> CreateAsync(CreateLabOrderDto dto);
        Task<IEnumerable<LabOrderResponseDto>> GetAllAsync(int page, int pageSize);

        Task<LabOrderResponseDto?> GetByIdAsync(int id);

        Task<IEnumerable<LabOrderResponseDto>> GetByAppointmentIdAsync(int appointmentId);
        Task<IEnumerable<LabOrderResponseDto>> GetByPatientIdAsync(int patientId, int userId, string role, int page, int pageSize);
        Task<IEnumerable<LabOrderResponseDto>> GetByDoctorIdAsync(int doctorId, int page, int pageSize);

        Task<bool> UpdateAsync(int id, string status);
        Task<bool> DeleteAsync(int id);
    }
}