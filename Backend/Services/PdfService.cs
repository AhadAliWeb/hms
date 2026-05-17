// Services/PdfService.cs
using Backend.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Backend.Services
{
    public class PdfService
    {
        public byte[] GenerateInvoicePdf(InvoiceResponseDto invoice)
        {


            QuestPDF.Settings.License = LicenseType.Community;

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    // Header
                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("Hospital Management System")
                                .FontSize(20).Bold();
                            col.Item().Text("Invoice").FontSize(16);
                        });

                        row.RelativeItem().AlignRight().Column(col =>
                        {
                            col.Item().Text($"Invoice #: {invoice.Id}");
                            col.Item().Text($"Date: {invoice.CreatedAt:dd/MM/yyyy}");
                            col.Item().Text($"Status: {invoice.Status}");
                        });
                    });

                    // Content
                    page.Content().PaddingVertical(1, Unit.Centimetre).Column(col =>
                    {
                        // Patient & Doctor Info
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Patient:").Bold();
                                c.Item().Text(invoice.PatientName);
                            });
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("Doctor:").Bold();
                                c.Item().Text(invoice.DoctorName);
                            });
                        });

                        col.Item().PaddingVertical(10).LineHorizontal(1);

                        // Invoice Items Table
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.RelativeColumn(1);
                                columns.RelativeColumn(1);
                            });

                            // Table Header
                            table.Header(header =>
                            {
                                header.Cell().Text("Description").Bold();
                                header.Cell().Text("Type").Bold();
                                header.Cell().AlignRight().Text("Amount").Bold();
                            });

                            // Table Rows
                            foreach (var item in invoice.Items)
                            {
                                table.Cell().Text(item.Description);
                                table.Cell().Text(item.Type);
                                table.Cell().AlignRight().Text($"${item.Amount:F2}");
                            }
                        });

                        col.Item().PaddingVertical(10).LineHorizontal(1);

                        // Total
                        col.Item().AlignRight()
                            .Text($"Total: ${invoice.TotalAmount:F2}").Bold().FontSize(14);
                    });

                    // Footer
                    page.Footer().AlignCenter()
                        .Text("Thank you for choosing our hospital.");
                });
            }).GeneratePdf();
        }
    }
}