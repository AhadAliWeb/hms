using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Backend.DTOs;
using System.Security.Claims;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdmissionController : ControllerBase
    {
        private readonly IAdmissionService _admissionService;

        public AdmissionController(IAdmissionService admissionService)
        {
            _admissionService = admissionService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse, Receptionist")]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var admissions = await _admissionService.GetAllAsync(page, pageSize);
            return Ok(admissions);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse, Receptionist")]
        public async Task<IActionResult> GetById(int id)
        {
            var admission = await _admissionService.GetByIdAsync(id);
            if (admission == null) return NotFound();
            return Ok(admission);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient, Receptionist")]
        public async Task<IActionResult> GetByPatientId(int patientId, int page = 1, int pageSize = 10)
        {
            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var admissions = await _admissionService.GetByPatientIdAsync(patientId, userId, role, page, pageSize);
            return Ok(admissions);
        }

        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse, Receptionist")]
        public async Task<IActionResult> GetByDoctorId(int doctorId, int page = 1, int pageSize = 10)
        {
            var admissions = await _admissionService.GetByDoctorIdAsync(doctorId, page, pageSize);
            return Ok(admissions);
        }

        [HttpGet("ward/{wardId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse, Receptionist")]
        public async Task<IActionResult> GetByWardId(int wardId, int page = 1, int pageSize = 10)
        {
            var admissions = await _admissionService.GetByWardIdAsync(wardId, page, pageSize);
            return Ok(admissions);
        }

        [HttpGet("search")]
        [Authorize(Roles = "Admin,Doctor,Nurse, Receptionist")]
        public async Task<IActionResult> Search(string query, int page = 1, int pageSize = 10)
        {
            var admissions = await _admissionService.SearchAsync(query, page, pageSize);
            return Ok(admissions);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Receptionist")]
        public async Task<IActionResult> Create([FromBody] CreateAdmissionDto dto)
        {
            var admission = await _admissionService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = admission.Id }, admission);
        }

        [HttpPut("{id}/discharge")]
        [Authorize(Roles = "Admin,Doctor,Nurse, Receptionist")]
        public async Task<IActionResult> Discharge(int id)
        {
            var success = await _admissionService.DischargeAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}