// Data/DataSeeder.cs
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class DataSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Users
            if (!await context.Users.AnyAsync(u => u.Role == "Doctor"))
            {
                var doctorUsers = new List<User>
                {
                    new User { FullName = "Dr. John Smith", Email = "john.smith@hospital.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"), Role = "Doctor", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { FullName = "Dr. Sarah Johnson", Email = "sarah.johnson@hospital.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"), Role = "Doctor", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { FullName = "Dr. Michael Lee", Email = "michael.lee@hospital.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor@123"), Role = "Doctor", IsActive = true, CreatedAt = DateTime.UtcNow }
                };
                await context.Users.AddRangeAsync(doctorUsers);
                await context.SaveChangesAsync();

                var doctors = new List<Doctor>
                {
                    new Doctor { UserId = doctorUsers[0].Id, Specialization = "Cardiology", Qualification = "MBBS, MD", ExperienceYears = 10, ConsultationFee = 100, CreatedAt = DateTime.UtcNow },
                    new Doctor { UserId = doctorUsers[1].Id, Specialization = "Neurology", Qualification = "MBBS, MD", ExperienceYears = 8, ConsultationFee = 120, CreatedAt = DateTime.UtcNow },
                    new Doctor { UserId = doctorUsers[2].Id, Specialization = "Orthopedics", Qualification = "MBBS, MS", ExperienceYears = 12, ConsultationFee = 90, CreatedAt = DateTime.UtcNow }
                };
                await context.Doctors.AddRangeAsync(doctors);
                await context.SaveChangesAsync();
            }

            // Patients
            if (!await context.Users.AnyAsync(u => u.Role == "Patient"))
            {
                var patientUsers = new List<User>
                {
                    new User { FullName = "Alice Brown", Email = "alice.brown@gmail.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Patient@123"), Role = "Patient", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { FullName = "Bob Wilson", Email = "bob.wilson@gmail.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Patient@123"), Role = "Patient", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new User { FullName = "Carol Davis", Email = "carol.davis@gmail.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Patient@123"), Role = "Patient", IsActive = true, CreatedAt = DateTime.UtcNow }
                };
                await context.Users.AddRangeAsync(patientUsers);
                await context.SaveChangesAsync();

                var patients = new List<Patient>
                {
                    new Patient { UserId = patientUsers[0].Id, BloodGroup = "A+", Address = "123 Main St", DateOfBirth = new DateTime(1990, 5, 15), EmergencyContact = "0300-1234567" },
                    new Patient { UserId = patientUsers[1].Id, BloodGroup = "B+", Address = "456 Oak Ave", DateOfBirth = new DateTime(1985, 8, 22), EmergencyContact = "0300-2345678" },
                    new Patient { UserId = patientUsers[2].Id, BloodGroup = "O-", Address = "789 Pine Rd", DateOfBirth = new DateTime(1995, 3, 10), EmergencyContact = "0300-3456789" }
                };
                await context.Patients.AddRangeAsync(patients);
                await context.SaveChangesAsync();
            }

            // Wards
            if (!await context.Wards.AnyAsync())
            {
                var wards = new List<Ward>
                {
                    new Ward { Name = "General Ward", Type = "General", TotalBeds = 20 },
                    new Ward { Name = "ICU", Type = "ICU", TotalBeds = 10 },
                    new Ward { Name = "Private Ward", Type = "Private", TotalBeds = 15 }
                };
                await context.Wards.AddRangeAsync(wards);
                await context.SaveChangesAsync();

                var beds = new List<Bed>();
                foreach (var ward in wards)
                {
                    for (int i = 1; i <= 3; i++)
                    {
                        beds.Add(new Bed { WardId = ward.Id, BedNumber = $"{ward.Type[0]}{i:D2}", IsOccupied = false });
                    }
                }
                await context.Beds.AddRangeAsync(beds);
                await context.SaveChangesAsync();
            }

            // Medicines
            if (!await context.Medicines.AnyAsync())
            {
                var medicines = new List<Medicine>
                {
                    new Medicine { Name = "Paracetamol", Description = "Pain reliever", Unit = "mg", Price = 5, StockQuantity = 500, LowStockThreshold = 50 },
                    new Medicine { Name = "Amoxicillin", Description = "Antibiotic", Unit = "mg", Price = 15, StockQuantity = 200, LowStockThreshold = 30 },
                    new Medicine { Name = "Ibuprofen", Description = "Anti-inflammatory", Unit = "mg", Price = 8, StockQuantity = 300, LowStockThreshold = 40 }
                };
                await context.Medicines.AddRangeAsync(medicines);
                await context.SaveChangesAsync();
            }

            // Lab Tests
            if (!await context.LabTests.AnyAsync())
            {
                var labTests = new List<LabTest>
                {
                    new LabTest { Name = "Blood Test", Description = "Complete blood count", Price = 50 },
                    new LabTest { Name = "X-Ray", Description = "Chest X-Ray", Price = 100 },
                    new LabTest { Name = "MRI", Description = "Brain MRI", Price = 300 }
                };
                await context.LabTests.AddRangeAsync(labTests);
                await context.SaveChangesAsync();
            }

            var count = await context.Users.CountAsync();
            Console.WriteLine($"Users in DB: {count}");
        }
    }
}