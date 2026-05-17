using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs;
using Backend.Services;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Backend.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientController(IPatientService patientService)
        {
            _patientService = patientService;
        }


        [Authorize(Roles = "Admin,Doctor,Receptionist,Patient")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var patient = await _patientService.GetByIdAsync(id, userId, role);
            if (patient == null) return NotFound();
            return Ok(patient);
        }

        [Authorize(Roles = "Admin,Doctor,Receptionist,Accountant")]
        [HttpGet]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10, string? search = null)
        {
            var patients = await _patientService.GetAllAsync(page, pageSize, search);
            return Ok(patients);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePatientDto dto)
        {
            var patient = await _patientService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = patient.Id }, patient);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreatePatientDto dto)
        {
            var updatedPatient = await _patientService.UpdateAsync(id, dto);
            if (updatedPatient == null) return NotFound();
            return Ok(updatedPatient);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _patientService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

    }
}

