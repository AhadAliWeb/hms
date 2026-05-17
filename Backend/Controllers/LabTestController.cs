
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Backend.DTOs;
using System.Security.Claims;


namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LabTestController : ControllerBase
    {
        private readonly ILabTestService _labTestService;

        public LabTestController(ILabTestService labTestService)
        {
            _labTestService = labTestService;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateLabTestDto dto)
        {
            var labTest = await _labTestService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = labTest.Id }, labTest);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<IActionResult> GetById(int id)
        {
            var labTest = await _labTestService.GetByIdAsync(id);
            if (labTest == null) return NotFound();
            return Ok(labTest);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]   
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var labTests = await _labTestService.GetAllAsync(page, pageSize);
            return Ok(labTests);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> Update(int id, CreateLabTestDto dto)
        {
            var updated = await _labTestService.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _labTestService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }

    }
}