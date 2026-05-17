using Backend.Interfaces;
using Backend.Models;
using Backend.Data;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;


namespace Backend.Services
{
    public class WardService : IWardService
    {
        private readonly AppDbContext _context;

        public WardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<WardResponseDto> CreateAsync(CreateWardDto dto)
        {
            var ward = new Ward
            {
                Name = dto.Name,
                Type = dto.Type,
                TotalBeds = dto.TotalBeds
            };

            _context.Wards.Add(ward);
            await _context.SaveChangesAsync();

            return new WardResponseDto
            {
                Id = ward.Id,
                Name = ward.Name,
                Type = ward.Type,
                TotalBeds = ward.TotalBeds,
                AvailableBeds = ward.Beds.Count(b => !b.IsOccupied)
            };
        }

        public async Task<IEnumerable<WardResponseDto>> GetAllAsync(int page, int pageSize)
        {
            return await _context.Wards
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(w => new WardResponseDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Type = w.Type,
                    TotalBeds = w.Beds.Count(),
                    AvailableBeds = w.Beds.Count(b => !b.IsOccupied)
                })
                .ToListAsync();
        }

        public async Task<WardResponseDto?> GetByIdAsync(int id)
        {
            var ward = await _context.Wards.FindAsync(id);
            if (ward == null) return null;

            return new WardResponseDto
            {
                Id = ward.Id,
                Name = ward.Name,
                Type = ward.Type,
                TotalBeds = ward.TotalBeds,
                AvailableBeds = ward.Beds.Count(b => !b.IsOccupied)
            };
        }

        public async Task<bool> UpdateAsync(int id, CreateWardDto dto)
        {
            var ward = await _context.Wards.FindAsync(id);
            if (ward == null) return false;

            ward.Name = dto.Name;
            ward.Type = dto.Type;
            ward.TotalBeds = dto.TotalBeds;

            _context.Wards.Update(ward);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var ward = await _context.Wards.FindAsync(id);
            if (ward == null) return false;

            _context.Wards.Remove(ward);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}