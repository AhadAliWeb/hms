using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Backend.DTOs;
using System.Security.Claims;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LabOrderController : ControllerBase
    {
        private readonly ILabOrderService _labOrderService;
        private readonly AppDbContext _context;

        public LabOrderController(ILabOrderService labOrderService, AppDbContext context)
        {
            _labOrderService = labOrderService;
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> Create(CreateLabOrderDto dto)
        {
            var labOrder = await _labOrderService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = labOrder.Id }, labOrder);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient,LabTechnician")]
        public async Task<IActionResult> GetById(int id)
        {
            var labOrder = await _labOrderService.GetByIdAsync(id);
            if (labOrder == null) return NotFound();
            return Ok(labOrder);
        }


        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse,LabTechnician")]   
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10)
        {
            var labOrders = await _labOrderService.GetAllAsync(page, pageSize);
            return Ok(labOrders);
        }

        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,LabTechnician")]
        public async Task<IActionResult> GetByDoctorId(int doctorId, int page = 1, int pageSize = 10)
        {
            var labOrders = await _labOrderService.GetByDoctorIdAsync(doctorId, page, pageSize);
            return Ok(labOrders);
        }

        [HttpGet("doctor/my-lab-orders")]
        [Authorize(Roles = "Admin,Doctor,Nurse,LabTechnician")]
        public async Task<IActionResult> GetMyLabOrders(int page = 1, int pageSize = 10)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            if (doctor == null) return NotFound("Doctor not found");

            var labOrders = await _labOrderService.GetByDoctorIdAsync(doctor.Id, page, pageSize);
            return Ok(labOrders);
        }




        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient,LabTechnician")]
        public async Task<IActionResult> GetByPatientId(int patientId, int page = 1, int pageSize = 10)
        {
            var role = User.FindFirst(ClaimTypes.Role)!.Value;
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var labOrders = await _labOrderService.GetByPatientIdAsync(patientId, userId, role, page, pageSize);
            return Ok(labOrders);
        }

        

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor,LabTechnician")]
        public async Task<IActionResult> Update(int id, string status)
        {
            var success = await _labOrderService.UpdateAsync(id, status);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _labOrderService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}