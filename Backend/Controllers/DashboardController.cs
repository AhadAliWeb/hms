
using Microsoft.AspNetCore.Mvc;
using Backend.Services;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Backend.DTOs;
using Backend.Data;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class DashboardController: ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly AppDbContext _context;
        public DashboardController(IDashboardService dashboardService, AppDbContext context)
        {
            _dashboardService = dashboardService;
            _context = context;
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            var dashboardData = await _dashboardService.GetAdminDashboardAsync();
            return Ok(dashboardData);
        }

        [HttpGet("doctor")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetDoctorDashboard()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            var dashboardData = await _dashboardService.GetDoctorDashboardAsync(userId);
            return Ok(dashboardData);
        }

        [HttpGet("accountant")]
        [Authorize(Roles = "Accountant")]
        public async Task<IActionResult> GetAccountantDashboard()
        {
            var dashboardData = await _dashboardService.GetAccountantDashboardAsync();
            return Ok(dashboardData);
        }

        [HttpGet("nurse")]
        [Authorize(Roles = "Nurse")]
        public async Task<IActionResult> GetNurseDashboard()
        {
            var dashboardData = await _dashboardService.GetNurseDashboardAsync();
            return Ok(dashboardData);
        }

    }
}