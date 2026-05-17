// Models/AuditLog.cs
namespace Backend.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public string EntityName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty; // Created, Updated, Deleted
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public int? UserId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}