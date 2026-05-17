using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Backend.DTOs;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BedController : ControllerBase
    {
        private readonly IBedService _bedService;

        public BedController(IBedService bedService)
        {
            _bedService = bedService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var beds = await _bedService.GetAllAsync(page, pageSize);
            return Ok(beds);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var bed = await _bedService.GetByIdAsync(id);
            if (bed == null) return NotFound();
            return Ok(bed);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateBedDto dto)
        {
            var bed = await _bedService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = bed.Id }, bed);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateBedDto dto)
        {
            var success = await _bedService.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpGet("available/{wardId}")]
        [Authorize]
        public async Task<IActionResult> GetAvailableByWard(int wardId, int page = 1, int pageSize = 10)
        {
            var beds = await _bedService.GetAvailableByWardAsync(wardId, page, pageSize);
            return Ok(beds);
        }

        [HttpGet("all/{wardId}")]
        [Authorize]
        public async Task<IActionResult> GetAllByWard(int wardId, int page = 1, int pageSize = 10)
        {
            var beds = await _bedService.GetAvailableByWardAsync(wardId, page, pageSize);
            return Ok(beds);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _bedService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}