using Backend.Interfaces;
using Backend.Models;
using Backend.Data;
using Backend.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class MedicineService : IMedicineService
    {
        private readonly AppDbContext _context;

        public MedicineService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MedicineResponseDto> CreateAsync(CreateMedicineDto dto)
        {
            var medicine = new Medicine
            {
                Name = dto.Name,
                Description = dto.Description,
                Unit = dto.Unit,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                LowStockThreshold = dto.LowStockThreshold
            };

            _context.Medicines.Add(medicine);
            await _context.SaveChangesAsync();

            return new MedicineResponseDto
            {
                Id = medicine.Id,
                Name = medicine.Name,
                Description = medicine.Description,
                Unit = medicine.Unit,
                Price = medicine.Price,
                StockQuantity = medicine.StockQuantity,
                LowStockThreshold = medicine.LowStockThreshold
            };
        }

        public async Task<IEnumerable<MedicineResponseDto>> GetAllAsync(int page, int pageSize, string? search)
        {
            var query = _context.Medicines.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(m => m.Name.Contains(search) || m.Description.Contains(search));
            }

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new MedicineResponseDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Description = m.Description,
                    Unit = m.Unit,
                    Price = m.Price,
                    StockQuantity = m.StockQuantity,
                    LowStockThreshold = m.LowStockThreshold
                })
                .ToListAsync();
        }

        public async Task<MedicineResponseDto?> GetByIdAsync(int id)
        {
            var medicine = await _context.Medicines.FindAsync(id);
            if (medicine == null) return null;

            return new MedicineResponseDto
            {
                Id = medicine.Id,
                Name = medicine.Name,
                Description = medicine.Description,
                Unit = medicine.Unit,
                Price = medicine.Price,
                StockQuantity = medicine.StockQuantity,
                LowStockThreshold = medicine.LowStockThreshold
            };
        }

        public async Task UpdateAsync(int id, CreateMedicineDto dto)
        {
            var medicine = await _context.Medicines.FindAsync(id);
            if (medicine == null) throw new Exception("Medicine not found");

            medicine.Name = dto.Name;
            medicine.Description = dto.Description;
            medicine.Unit = dto.Unit;
            medicine.Price = dto.Price;
            medicine.StockQuantity = dto.StockQuantity;
            medicine.LowStockThreshold = dto.LowStockThreshold;

            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<MedicineResponseDto>> GetLowStockAsync()
        {
            return await _context.Medicines
                .Where(m => m.StockQuantity <= m.LowStockThreshold)
                .Select(m => new MedicineResponseDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Description = m.Description,
                    Unit = m.Unit,
                    Price = m.Price,
                    StockQuantity = m.StockQuantity,
                    LowStockThreshold = m.LowStockThreshold
                })
                .ToListAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var medicine = await _context.Medicines.FindAsync(id);
            if (medicine == null) throw new Exception("Medicine not found");

            _context.Medicines.Remove(medicine);
            await _context.SaveChangesAsync();

        }


    }
}