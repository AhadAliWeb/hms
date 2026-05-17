using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Backend.DTOs;
using System.Security.Claims;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PrescriptionController : ControllerBase
    {
        private readonly IPrescriptionService _prescriptionService;
        private readonly AppDbContext _context;

        public PrescriptionController(IPrescriptionService prescriptionService, AppDbContext context)
        {
            _prescriptionService = prescriptionService;
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10, string? search = null, string? status = null)
        {
            var prescriptions = await _prescriptionService.GetAllAsync(page, pageSize, search, status);
            return Ok(prescriptions);
        }

        [HttpGet("my-prescriptions")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMyPrescriptions(int page = 1, int pageSize = 10)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var doctor = _context.Doctors.FirstOrDefault(d => d.UserId == userId);

            if (doctor == null) return NotFound("Doctor profile not found");
            Console.WriteLine($"User ID: {userId}, Doctor Found: {doctor.Id}");
            var prescriptions = await _prescriptionService.GetMyPrescriptionsAsync(doctor.Id, page, pageSize);
            return Ok(prescriptions);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Pharmacist,Patient")]
        public async Task<IActionResult> GetById(int id)
        {
            var prescription = await _prescriptionService.GetByIdAsync(id);
            if (prescription == null) return NotFound();
            return Ok(prescription);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Pharmacist,Patient")]
        public async Task<IActionResult> GetByPatientId(int patientId, int page = 1, int pageSize = 10)
        {
            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var prescriptions = await _prescriptionService.GetByPatientIdAsync(patientId, userId, role, page, pageSize);
            return Ok(prescriptions);
        }

        [HttpGet("patient/my-prescriptions")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyPrescriptionsPatient(int page = 1, int pageSize = 10, string? search = null)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) return NotFound("Patient profile not found");
            var prescriptions = await _prescriptionService.GetMyPrescriptionsPatientAsync(patient.Id, page, pageSize, search);
            return Ok(prescriptions);
        }

        

        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GetByDoctorId(int doctorId, int page = 1, int pageSize = 10)
        {
            var prescriptions = await _prescriptionService.GetByDoctorIdAsync(doctorId, page, pageSize);
            return Ok(prescriptions);
        }

        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Create([FromBody] CreatePrescriptionDto dto)
        {
            var prescription = await _prescriptionService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = prescription.Id }, prescription);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Update(int id, [FromBody] CreatePrescriptionDto dto)
        {
            await _prescriptionService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpPut("{id}/dispense")]
        [Authorize(Roles = "Pharmacist")]
        public async Task<IActionResult> Dispense(int id)
        {
            var success = await _prescriptionService.DispenseAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> Delete(int id)
        {
            await _prescriptionService.DeleteAsync(id);
            return NoContent();
        }
    }
}