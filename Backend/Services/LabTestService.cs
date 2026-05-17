using Backend.Data;
using Backend.Models;
using Backend.DTOs;
using Backend.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace Backend.Services
{
    public class LabTestService: ILabTestService
    {
        private readonly AppDbContext _context;
        public LabTestService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<LabTestResponseDto> CreateAsync(CreateLabTestDto dto)
        {
            var labTest = new LabTest
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price
            };

            await _context.LabTests.AddAsync(labTest);
            await _context.SaveChangesAsync();

            return new LabTestResponseDto
            {
                Id = labTest.Id,
                Name = labTest.Name,
                Description = labTest.Description,
                Price = labTest.Price
            };
        }

        public async Task<IEnumerable<LabTestResponseDto>> GetAllAsync(int page, int pageSize)
        {
            return await _context.LabTests
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(lt => new LabTestResponseDto
                {
                    Id = lt.Id,
                    Name = lt.Name,
                    Description = lt.Description,
                    Price = lt.Price
                })
                .ToListAsync();
        }

        public async Task<LabTestResponseDto?> GetByIdAsync(int id)
        {
            var labTest = await _context.LabTests.FindAsync(id);
            if (labTest == null) return null;

            return new LabTestResponseDto
            {
                Id = labTest.Id,
                Name = labTest.Name,
                Description = labTest.Description,
                Price = labTest.Price
            };
        }

        public async Task<bool> UpdateAsync(int id, CreateLabTestDto dto)
        {
            var labTest = await _context.LabTests.FindAsync(id);
            if (labTest == null) return false;

            labTest.Name = dto.Name;
            labTest.Description = dto.Description;
            labTest.Price = dto.Price;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var labTest = await _context.LabTests.FindAsync(id);
            if (labTest == null) return false;

            _context.LabTests.Remove(labTest);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}