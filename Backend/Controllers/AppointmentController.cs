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
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        private readonly AppDbContext _context;
        public AppointmentController(IAppointmentService appointmentService, AppDbContext context)
        {
            _appointmentService = appointmentService;
            _context = context; 
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var appointment = await _appointmentService.GetByIdAsync(id);
            if (appointment == null) return NotFound();
            return Ok(appointment);
        }

        [Authorize(Roles = "Doctor,Admin,Receptionist")]
        [HttpGet]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10, string? search = null, string? status = null)
        {
            var appointments = await _appointmentService.GetAllAsync(page, pageSize, search, status);
            return Ok(appointments);
        }

        [Authorize(Roles = "Patient,Accountant")]
        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatientId(int patientId, int page = 1, int pageSize = 10, string?search = null,string? status = null)
        {
            var appointments = await _appointmentService.GetByPatientIdAsync(patientId, page, pageSize, search, status);
            return Ok(appointments);
        }

        [Authorize(Roles = "Patient,Accountant")]
        [HttpGet("patient/my-appointments")]
        public async Task<IActionResult> GetMyAppointments(int page = 1, int pageSize = 10, string?search = null,string? status = null)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var appointments = await _appointmentService.GetByPatientIdAsync(userId, page, pageSize, search, status);
            return Ok(appointments);
        }

        [Authorize(Roles = "Doctor")]
        [HttpGet("doctor/{doctorId}")]
        public async Task<IActionResult> GetByDoctorId(int doctorId, int page = 1, int pageSize = 10)
        {
            var appointments = await _appointmentService.GetByDoctorIdAsync(doctorId, page, pageSize);
            return Ok(appointments);
        }

        [HttpGet("my-appointments")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMyAppointments(int page = 1, int pageSize = 10)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            var appointments = await _appointmentService.GetByDoctorIdAsync(doctor.Id, page, pageSize);
            return Ok(appointments);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
        {
            var appointment = await _appointmentService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, appointment);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var updatedAppointment = await _appointmentService.UpdateStatusAsync(id, status);
            if (updatedAppointment == null) return NotFound();
            return Ok(updatedAppointment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _appointmentService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }


    }
}