using Backend.DTOs;

namespace Backend.Interfaces
{
    public interface IAuthService
    {
        Task<int> RegisterAsync(RegisterDto dto);
        Task<string> LoginAsync(LoginDto dto);
    }
}