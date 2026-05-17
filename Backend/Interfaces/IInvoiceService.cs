
using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IInvoiceService
    {
        Task<InvoiceResponseDto> CreateAsync(CreateInvoiceDto dto);
        Task<IEnumerable<InvoiceResponseDto>> GetByPatientIdAsync(int patientId, int userId, string userRole, int page, int pageSize);

        Task<IEnumerable<InvoiceResponseDto>> GetMyInvoices(int patientId, int page, int pageSize, string? search, string? status);
        Task<IEnumerable<InvoiceResponseDto>> GetAllAsync(int page, int pageSize, string? search, string? status);
        Task<InvoiceResponseDto?> GetByIdAsync(int id);

        Task<bool> MarkAsPaidAsync(int id);
        Task<bool> UpdateAsync(int id, string status);
        Task<bool> DeleteAsync(int id);
    }
}