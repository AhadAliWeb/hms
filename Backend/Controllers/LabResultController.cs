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
    
    public class LabResultController : ControllerBase
    {
        private readonly ILabResultService _labResultService;

        public LabResultController(ILabResultService labResultService)
        {
            _labResultService = labResultService;
        }

        [HttpPost]
        [Authorize(Roles = "LabTechnician")]
        public async Task<IActionResult> Create(CreateLabResultDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var labResult = await _labResultService.CreateAsync(userId, dto);
            return CreatedAtAction(nameof(GetById), new { id = labResult.Id }, labResult);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<IActionResult> GetById(int id)
        {
            var labResult = await _labResultService.GetByIdAsync(id);
            if (labResult == null) return NotFound();
            return Ok(labResult);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse")]   
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var labResults = await _labResultService.GetAllAsync(page, pageSize);
            return Ok(labResults);
        }


        [HttpGet("laborder/{labOrderId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<IActionResult> GetByLabOrderId(int labOrderId, int page = 1, int pageSize = 10)
        {
            var labResults = await _labResultService.GetByLabOrderIdAsync(labOrderId, page, pageSize);
            return Ok(labResults);
        }

        [HttpGet("technician/{technicianId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,LabTechnician")]
        public async Task<IActionResult> GetByTechnicianId(int technicianId, int page = 1, int pageSize = 10)
        {
            var labResults = await _labResultService.GetByTechnicianIdAsync(technicianId, page, pageSize);
            return Ok(labResults);
        }

        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetByDoctorId(int doctorId, int page = 1, int pageSize = 10)
        {
            var labResults = await _labResultService.GetByDoctorIdAsync(doctorId, page, pageSize);
            return Ok(labResults);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient")]
        public async Task<IActionResult> GetByPatientId(int patientId, int page = 1, int pageSize = 10)
        {
            var userRole = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var labResults = await _labResultService.GetByPatientIdAsync(patientId, userId, userRole, page, pageSize);
            return Ok(labResults);
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> Update(int id, CreateLabResultDto dto)
        {
            var updated = await _labResultService.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _labResultService.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}