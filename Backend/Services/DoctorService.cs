using Backend.Data;
using Backend.Models;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly AppDbContext _context;

        private readonly IAuthService _authService;

        public DoctorService(AppDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        public async Task<DoctorResponseDto> CreateAsync(CreateDoctorDto dto)
        {
            var userId = await _authService.RegisterAsync(new RegisterDto
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Password = dto.Password,
                Role = "Doctor"
            });

            var doctor = new Doctor
            {
                UserId = userId,
                Specialization = dto.Specialization,
                Qualification = dto.Qualification,
                ExperienceYears = dto.ExperienceYears,
                ConsultationFee = dto.ConsultationFee
            };

            await _context.Doctors.AddAsync(doctor);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(doctor.UserId);

            if (user == null) throw new Exception("User not found after registration");


            
            return new DoctorResponseDto
            {
                Id = doctor.Id,
                FullName = user.FullName,
                Email = user.Email,
                Specialization = doctor.Specialization,
                Qualification = doctor.Qualification,
                ExperienceYears = doctor.ExperienceYears,
                ConsultationFee = doctor.ConsultationFee
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null) return false;

             var user = await _context.Users.FindAsync(doctor.UserId);

            if (user == null) return false;

            // Soft delete: mark user as inactive instead of deleting
            user.IsActive = false;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<DoctorResponseDto>> GetAllAsync(int page, int pageSize, string? search)
        {
            var query = _context.Doctors
                .Include(d => d.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(d => d.User.FullName.Contains(search) || d.User.Email.Contains(search));
            }

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(doctor => new DoctorResponseDto
                {
                    Id = doctor.Id,
                    FullName = doctor.User.FullName,
                    Email = doctor.User.Email,
                    Specialization = doctor.Specialization,
                    Qualification = doctor.Qualification,
                    ExperienceYears = doctor.ExperienceYears,
                    ConsultationFee = doctor.ConsultationFee
                })
                .ToListAsync();
        }

        public async Task<DoctorResponseDto?> GetByIdAsync(int id)
        {
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (doctor == null) return null;

            return new DoctorResponseDto
            {
                Id = doctor.Id,
                FullName = doctor.User.FullName,
                Email = doctor.User.Email,
                Specialization = doctor.Specialization,
                Qualification = doctor.Qualification,
                ExperienceYears = doctor.ExperienceYears,
                ConsultationFee = doctor.ConsultationFee
            };
        }

        public async Task<DoctorResponseDto?> UpdateAsync(int id, CreateDoctorDto dto)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null) return null;

            var user = await _context.Users.FindAsync(doctor.UserId);
            if (user == null) return null;

            // Update user information
            user.FullName = dto.FullName;
            user.Email = dto.Email;

            // Update doctor information
            doctor.Specialization = dto.Specialization;
            doctor.Qualification = dto.Qualification;
            doctor.ExperienceYears = dto.ExperienceYears;
            doctor.ConsultationFee = dto.ConsultationFee;

            await _context.SaveChangesAsync();

            return new DoctorResponseDto
            {
                Id = doctor.Id,
                FullName = user.FullName,
                Email = user.Email,
                Specialization = doctor.Specialization,
                Qualification = doctor.Qualification,
                ExperienceYears = doctor.ExperienceYears,
                ConsultationFee = doctor.ConsultationFee
            };
        }
    }
}

