
using Backend.DTOs;
using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Backend.Interfaces;

namespace Backend.Services
{
    public class PatientService: IPatientService
    {

        private readonly AppDbContext _context;
        private readonly IAuthService _authService;


        public PatientService(AppDbContext context, IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }
        public async Task<PatientResponseDto> CreateAsync(CreatePatientDto dto)
        {
            var userId = await _authService.RegisterAsync(new RegisterDto
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Password = dto.Password,
                Role = "Patient"
            });

            var patient = new Patient
            {
                UserId = userId,
                BloodGroup = dto.BloodGroup,
                Address = dto.Address,
                DateOfBirth = dto.DateOfBirth,
                EmergencyContact = dto.EmergencyContact
            };

            await _context.Patients.AddAsync(patient);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(patient.UserId);

            if (user == null) throw new Exception("User not found after registration");

            return new PatientResponseDto
            {
                Id = patient.Id,
                FullName = user.FullName,
                Email = user.Email,
                BloodGroup = patient.BloodGroup,
                Address = patient.Address,
                DateOfBirth = patient.DateOfBirth,
                EmergencyContact = patient.EmergencyContact
            };
        }

        public async Task<PatientResponseDto?> GetByIdAsync(
            int id,
            int userId,
            string role)
        {
            var query = _context.Patients
                .Include(p => p.User)
                .AsQueryable();

            if (role != "Admin")
            {
                query = query.Where(p => p.UserId == userId);
            }

            var patient = await query
                .FirstOrDefaultAsync(p => p.Id == id);

            if (patient == null)
                return null;

            return new PatientResponseDto
            {
                Id = patient.Id,
                FullName = patient.User.FullName,
                Email = patient.User.Email,
                BloodGroup = patient.BloodGroup,
                Address = patient.Address,
                DateOfBirth = patient.DateOfBirth,
                EmergencyContact = patient.EmergencyContact
            };
        }

        public async Task<IEnumerable<PatientResponseDto>> GetAllAsync(int page, int pageSize, string? search)
        {
            var query = _context.Patients.Include(p => p.User).AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.User.FullName.Contains(search) || p.User.Email.Contains(search));
            }

            var patients = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return patients.Select(p => new PatientResponseDto
            {
                Id = p.Id,
                FullName = p.User.FullName,
                Email = p.User.Email,
                BloodGroup = p.BloodGroup,
                Address = p.Address,
                DateOfBirth = p.DateOfBirth,
                EmergencyContact = p.EmergencyContact
            }).ToList();
        }

        public async Task<PatientResponseDto?> UpdateAsync(int id, CreatePatientDto dto)
        {
            var patient = await _context.Patients.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
            if (patient == null) return null;

            patient.BloodGroup = dto.BloodGroup;
            patient.Address = dto.Address;
            patient.DateOfBirth = dto.DateOfBirth;
            patient.EmergencyContact = dto.EmergencyContact;

            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
            return new PatientResponseDto
            {
                Id = patient.Id,
                FullName = patient.User.FullName,
                Email = patient.User.Email,
                BloodGroup = patient.BloodGroup,
                Address = patient.Address,
                DateOfBirth = patient.DateOfBirth,
                EmergencyContact = patient.EmergencyContact
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return false;

            var user = await _context.Users.FindAsync(patient.UserId);

            if (user == null) return false;

            // Soft delete: mark user as inactive instead of deleting
            user.IsActive = false;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            
            return true;
        }


    }
}