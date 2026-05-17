
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Backend.DTOs;
using System.Security.Claims;
using Backend.Services;
using System.Text.Json;
using Backend.Data;
using Microsoft.EntityFrameworkCore;


namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;
        private readonly AppDbContext _context;

        public InvoiceController(IInvoiceService invoiceService, AppDbContext context)
        {
            _invoiceService = invoiceService;
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Create(CreateInvoiceDto dto)
        {
            var invoice = await _invoiceService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient,Accountant")]
        public async Task<IActionResult> GetById(int id)
        {
            var invoice = await _invoiceService.GetByIdAsync(id);
            if (invoice == null) return NotFound();
            return Ok(invoice);
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Doctor,Nurse,Patient,Accountant")]
        public async Task<IActionResult> GetByPatientId(int patientId, int page = 1, int pageSize = 10)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var userRole = User.FindFirst(ClaimTypes.Role)!.Value;
            var invoices = await _invoiceService.GetByPatientIdAsync(patientId, userId, userRole, page, pageSize);
            return Ok(invoices);
        }

        [HttpGet("patient/my-invoices")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> GetMyInvoices(int page = 1, int pageSize = 10, string? search = null, string? status = null)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (patient == null) return NotFound("Patient profile not found");
            var invoices = await _invoiceService.GetMyInvoices(patient.Id, page, pageSize, search, status);
            return Ok(invoices);
        }

        // Add to InvoiceController
        [HttpGet("{id}/pdf")]
        [Authorize(Roles = "Admin,Accountant,Patient")]
        public async Task<IActionResult> GetInvoicePdf(int id)
        {
            var invoice = await _invoiceService.GetByIdAsync(id);
            if (invoice == null) return NotFound();

           Console.WriteLine(JsonSerializer.Serialize(invoice.Items));

            var pdfService = new PdfService();
            var pdfBytes = pdfService.GenerateInvoicePdf(invoice);

            return File(pdfBytes, "application/pdf", $"Invoice_{id}.pdf");
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Doctor,Nurse,Accountant")]
        public async Task<IActionResult> GetAll(int page = 1, int pageSize = 10, string? search = null, string? status = null)
        {
            var invoices = await _invoiceService.GetAllAsync(page, pageSize, search, status);
            return Ok(invoices);
        }

        [HttpPost("{id}/pay")]
        [Authorize(Roles = "Accountant")]
        public async Task<IActionResult> MarkAsPaid(int id)
        {
            var success = await _invoiceService.MarkAsPaidAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Update(int id, string status)
        {
            var success = await _invoiceService.UpdateAsync(id, status);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _invoiceService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        } 
    }
}