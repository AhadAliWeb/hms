

using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Backend.DTOs;

namespace Backend.Controllers {


    [ApiController]
    [Route("api/[controller]")]
    public class WardController : ControllerBase
    {
        private readonly IWardService _wardService;

        public WardController(IWardService wardService)
        {
            _wardService = wardService;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var wards = await _wardService.GetAllAsync(page, pageSize);
            return Ok(wards);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var ward = await _wardService.GetByIdAsync(id);
            if (ward == null) return NotFound();
            return Ok(ward);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateWardDto dto)
        {
            var ward = await _wardService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = ward.Id }, ward);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateWardDto dto)
        {
            var success = await _wardService.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _wardService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }

}