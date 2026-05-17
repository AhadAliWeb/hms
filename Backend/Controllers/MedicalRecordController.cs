

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs;
using Backend.Services;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class MedicalRecordController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalRecordService;
        private readonly AppDbContext _context;

        public MedicalRecordController(IMedicalRecordService medicalRecordService, AppDbContext context)
        {
            _context = context;
            _medicalRecordService = medicalRecordService;
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var record = await _medicalRecordService.GetByIdAsync(id);
            if (record == null) return NotFound();
            return Ok(record);
        }

        [Authorize(Roles = "Doctor")]
        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatientId(int patientId, int page = 1, int pageSize = 10)
        {
            var records = await _medicalRecordService.GetByPatientIdAsync(patientId, page, pageSize);
            return Ok(records);
        }

        [Authorize(Roles = "Patient")]
        [HttpGet("patient/my-records")]
        public async Task<IActionResult> GetByPatientId(int page = 1, int pageSize = 10)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            var records = await _medicalRecordService.GetByPatientIdAsync(patient.Id, page, pageSize);
            return Ok(records);
        }

        [Authorize(Roles = "Doctor")]
        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetByDoctorId(int doctorId, int page = 1, int pageSize = 10)
        {
            var records = await _medicalRecordService.GetByDoctorIdAsync(doctorId, page, pageSize);
            return Ok(records);
        }

        [Authorize(Roles = "Doctor")]
        [HttpGet("doctor/my-patients-records")]
        public async Task<IActionResult> GetMyPatientsRecords(int page = 1, int pageSize = 10)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            var records = await _medicalRecordService.GetByDoctorIdAsync(doctor.Id, page, pageSize);
            return Ok(records);
        }

        [Authorize(Roles = "Doctor")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMedicalRecordDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            dto.DoctorId = doctor.Id;
            var record = await _medicalRecordService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = record.Id }, record);
        }

        [Authorize(Roles = "Doctor")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _medicalRecordService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}