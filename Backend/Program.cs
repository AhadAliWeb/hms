using System.Text;
using Backend.Data;
using Backend.Interfaces;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Backend.Models;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<AuditInterceptor>();

builder.Services.AddDbContext<AppDbContext>((sp, options) =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
           .AddInterceptors(sp.GetRequiredService<AuditInterceptor>());
});

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IMedicalRecordService, MedicalRecordService>();
builder.Services.AddScoped<IWardService, WardService>();
builder.Services.AddScoped<IBedService, BedService>();
builder.Services.AddScoped<IAdmissionService, AdmissionService>();
builder.Services.AddScoped<IMedicineService, MedicineService>();
builder.Services.AddScoped<IPrescriptionService, PrescriptionService>();
builder.Services.AddScoped<ILabTestService, LabTestService>();
builder.Services.AddScoped<ILabOrderService, LabOrderService>();
builder.Services.AddScoped<ILabResultService, LabResultService>();
builder.Services.AddScoped<IInvoiceService, InvoiceService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<PdfService>();







builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});



var app = builder.Build();

// For Static Files (e.g., For React)
app.UseDefaultFiles();   // serves index.html automatically
app.UseStaticFiles();    // enables wwwroot


using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        await DataSeeder.SeedAsync(context);
        Console.WriteLine("Seeding completed");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Seeding error: {ex.Message}");
    }
}

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // if (!context.Users.Any(u => u.Role == "Admin"))
    // {
    //     var admin = new User
    //     {
    //         FullName = "Admin",
    //         Email = "admin@hospital.com",
    //         PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
    //         Role = "Admin",
    //         IsActive = true,
    //         CreatedAt = DateTime.UtcNow
    //     };

    //     context.Users.Add(admin);
    //     await context.SaveChangesAsync();
    // }

    var usersToSeed = new[]
{
    new User { FullName = "Admin", Email = "admin@hospital.com", Role = "Admin", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123") },
    new User { FullName = "Receptionist", Email = "receptionist@hospital.com", Role = "Receptionist", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Receptionist@123") },
    new User { FullName = "Nurse", Email = "nurse@hospital.com", Role = "Nurse", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Nurse@123") },
    new User { FullName = "Pharmacist", Email = "pharmacist@hospital.com", Role = "Pharmacist", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Pharmacist@123") },
    new User { FullName = "Lab Technician", Email = "lab@hospital.com", Role = "LabTechnician", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Lab@123") },
    new User { FullName = "Accountant", Email = "accountant@hospital.com", Role = "Accountant", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Accountant@123") },
};

foreach (var u in usersToSeed)
{
    if (!context.Users.Any(x => x.Email == u.Email))
    {
        u.IsActive = true;
        u.CreatedAt = DateTime.UtcNow;
        context.Users.Add(u);
    }
}

await context.SaveChangesAsync();

    
}



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


app.UseCors("AllowAll");


app.Run();

