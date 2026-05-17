// Data/AuditInterceptor.cs
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System.Text.Json;

namespace Backend.Data
{
    public class AuditInterceptor : SaveChangesInterceptor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditInterceptor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            if (eventData.Context == null) return await base.SavingChangesAsync(eventData, result, cancellationToken);

            var context = eventData.Context;
            var auditLogs = new List<AuditLog>();

            var userId = _httpContextAccessor.HttpContext?.User
                .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            foreach (var entry in context.ChangeTracker.Entries())
            {
                if (entry.Entity is AuditLog) continue;

                string? action = entry.State switch
                {
                    EntityState.Added => "Created",
                    EntityState.Modified => "Updated",
                    EntityState.Deleted => "Deleted",
                    _ => null
                };

                if (action == null) continue;

                auditLogs.Add(new AuditLog
                {
                    EntityName = entry.Entity.GetType().Name,
                    Action = action,
                    OldValue = entry.State == EntityState.Modified
                        ? JsonSerializer.Serialize(entry.OriginalValues.ToObject())
                        : null,
                    NewValue = entry.State != EntityState.Deleted
                        ? JsonSerializer.Serialize(entry.CurrentValues.ToObject())
                        : null,
                    UserId = userId != null ? int.Parse(userId) : null,
                    Timestamp = DateTime.UtcNow
                });
            }

            await context.Set<AuditLog>().AddRangeAsync(auditLogs, cancellationToken);
            return await base.SavingChangesAsync(eventData, result, cancellationToken);
        }
    }
}