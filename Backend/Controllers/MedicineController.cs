using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Backend.DTOs;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicineController : ControllerBase
    {
        private readonly IMedicineService _medicineService;

        public MedicineController(IMedicineService medicineService)
        {
            _medicineService = medicineService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10, string? search = null)
        {
            var medicines = await _medicineService.GetAllAsync(page, pageSize, search);
            return Ok(medicines);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var medicine = await _medicineService.GetByIdAsync(id);
            if (medicine == null) return NotFound();
            return Ok(medicine);
        }

        [HttpGet("low-stock")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> GetLowStock()
        {
            var medicines = await _medicineService.GetLowStockAsync();
            return Ok(medicines);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> Create([FromBody] CreateMedicineDto dto)
        {
            var medicine = await _medicineService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = medicine.Id }, medicine);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateMedicineDto dto)
        {
            await _medicineService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _medicineService.DeleteAsync(id);
            return NoContent();
        }
    }
}