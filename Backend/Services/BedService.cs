using Backend.Interfaces;
using Backend.Models;
using Backend.Data;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class BedService : IBedService
    {
        private readonly AppDbContext _context;

        public BedService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<BedResponseDto> CreateAsync(CreateBedDto dto)
        {
            var ward = await _context.Wards.FindAsync(dto.WardId);
            if (ward == null) throw new Exception("Ward not found");

            var bed = new Bed
            {
                WardId = dto.WardId,
                BedNumber = dto.BedNumber,
                IsOccupied = false
            };

            _context.Beds.Add(bed);
            await _context.SaveChangesAsync();

            return new BedResponseDto
            {
                Id = bed.Id,
                WardName = ward.Name,
                BedNumber = bed.BedNumber,
                IsOccupied = bed.IsOccupied
            };

        }

        public async Task<IEnumerable<BedResponseDto>> GetAllAsync(int page, int pageSize)
        {
            return await _context.Beds
                .Include(b => b.Ward)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BedResponseDto
                {
                    Id = b.Id,
                    WardName = b.Ward.Name,
                    BedNumber = b.BedNumber,
                    IsOccupied = b.IsOccupied
                })
                .ToListAsync();
        }

        public async Task<BedResponseDto?> GetByIdAsync(int id)
        {
            var bed = await _context.Beds
                .Include(b => b.Ward)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (bed == null) return null;

            return new BedResponseDto
            {
                Id = bed.Id,
                WardName = bed.Ward.Name,
                BedNumber = bed.BedNumber,
                IsOccupied = bed.IsOccupied
            };
        }

        public async Task<IEnumerable<BedResponseDto>> GetAvailableByWardAsync(int wardId, int page, int pageSize)
        {
            return await _context.Beds
                .Include(b => b.Ward)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Where(b => b.WardId == wardId && !b.IsOccupied)
                .Select(b => new BedResponseDto
                {
                    Id = b.Id,
                    WardName = b.Ward.Name,
                    BedNumber = b.BedNumber,
                    IsOccupied = b.IsOccupied
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<BedResponseDto>> GetAllByWardAsync(int wardId, int page, int pageSize)
        {
            return await _context.Beds
                .Include(b => b.Ward)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Where(b => b.WardId == wardId)
                .Select(b => new BedResponseDto
                {
                    Id = b.Id,
                    WardName = b.Ward.Name,
                    BedNumber = b.BedNumber,
                    IsOccupied = b.IsOccupied
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateAsync(int id, CreateBedDto dto)
        {
            var bed = await _context.Beds.FindAsync(id);
            if (bed == null) return false;

            var ward = await _context.Wards.FindAsync(dto.WardId);
            if (ward == null) throw new Exception("Ward not found");

            bed.WardId = dto.WardId;
            bed.BedNumber = dto.BedNumber;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var bed = await _context.Beds.FindAsync(id);
            if (bed == null) return false;

            _context.Beds.Remove(bed);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}