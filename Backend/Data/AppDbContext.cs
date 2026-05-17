// Data/AppDbContext.cs
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<Doctor> Doctors => Set<Doctor>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
        public DbSet<Ward> Wards => Set<Ward>();
        public DbSet<Bed> Beds => Set<Bed>();
        public DbSet<Admission> Admissions => Set<Admission>();

        public DbSet<Medicine> Medicines => Set<Medicine>();
        public DbSet<Prescription> Prescriptions => Set<Prescription>();
        public DbSet<PrescriptionItem> PrescriptionItems => Set<PrescriptionItem>();

        // DbSets
        public DbSet<LabTest> LabTests => Set<LabTest>();
        public DbSet<LabOrder> LabOrders => Set<LabOrder>();
        public DbSet<LabResult> LabResults => Set<LabResult>();

        public DbSet<Invoice> Invoices => Set<Invoice>();
        public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();

        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(150);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.Role).IsRequired();
            });

            // Patient
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.BloodGroup).HasMaxLength(5);
                entity.Property(p => p.EmergencyContact).HasMaxLength(15);
                entity.HasOne(p => p.User)
                      .WithOne()
                      .HasForeignKey<Patient>(p => p.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Doctor
            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.HasKey(d => d.Id);
                entity.Property(d => d.Specialization).IsRequired().HasMaxLength(100);
                entity.Property(d => d.Qualification).IsRequired().HasMaxLength(100);
                entity.Property(d => d.ConsultationFee).HasColumnType("decimal(10,2)");
                entity.HasOne(d => d.User)
                      .WithOne()
                      .HasForeignKey<Doctor>(d => d.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Appointment
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.Property(a => a.Status);
                entity.HasOne(a => a.Patient)
                      .WithMany(p => p.Appointments)
                      .HasForeignKey(a => a.PatientId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Doctor)
                      .WithMany(d => d.Appointments)
                      .HasForeignKey(a => a.DoctorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // MedicalRecord
            modelBuilder.Entity<MedicalRecord>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Diagnosis).IsRequired().HasMaxLength(500);
                entity.Property(m => m.Prescription).IsRequired().HasMaxLength(1000);
                entity.HasOne(m => m.Patient)
                      .WithMany(p => p.MedicalRecords)
                      .HasForeignKey(m => m.PatientId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(m => m.Doctor)
                      .WithMany(d => d.MedicalRecords)
                      .HasForeignKey(m => m.DoctorId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(m => m.Appointment)
                      .WithOne()
                      .HasForeignKey<MedicalRecord>(m => m.AppointmentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Ward>(entity =>
            {
                entity.HasKey(w => w.Id);
                entity.Property(w => w.Name).IsRequired().HasMaxLength(100);
                entity.Property(w => w.Type).IsRequired().HasMaxLength(50);
            });

            modelBuilder.Entity<Bed>(entity =>
            {
                entity.HasKey(b => b.Id);
                entity.Property(b => b.BedNumber).IsRequired().HasMaxLength(10);
                entity.HasOne(b => b.Ward)
                    .WithMany(w => w.Beds)
                    .HasForeignKey(b => b.WardId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Admission>(entity =>
            {
                entity.HasKey(a => a.Id);
                entity.HasOne(a => a.Patient)
                    .WithMany()
                    .HasForeignKey(a => a.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Bed)
                    .WithOne(b => b.Admission)
                    .HasForeignKey<Admission>(a => a.BedId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(a => a.Doctor)
                    .WithMany()
                    .HasForeignKey(a => a.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
            modelBuilder.Entity<Medicine>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Name).IsRequired().HasMaxLength(100);
                entity.Property(m => m.Unit).IsRequired().HasMaxLength(20);
                entity.Property(m => m.Price).HasColumnType("decimal(10,2)");
            });

            modelBuilder.Entity<Prescription>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Status).IsRequired().HasMaxLength(20);
                entity.HasOne(p => p.Patient)
                    .WithMany()
                    .HasForeignKey(p => p.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(p => p.Doctor)
                    .WithMany()
                    .HasForeignKey(p => p.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(p => p.Appointment)
                    .WithMany()
                    .HasForeignKey(p => p.AppointmentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PrescriptionItem>(entity =>
            {
                entity.HasKey(pi => pi.Id);
                entity.Property(pi => pi.Dosage).IsRequired().HasMaxLength(50);
                entity.Property(pi => pi.Frequency).IsRequired().HasMaxLength(50);
                entity.HasOne(pi => pi.Prescription)
                    .WithMany(p => p.PrescriptionItems)
                    .HasForeignKey(pi => pi.PrescriptionId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(pi => pi.Medicine)
                    .WithMany(m => m.PrescriptionItems)
                    .HasForeignKey(pi => pi.MedicineId)
                    .OnDelete(DeleteBehavior.Restrict);
            });


            modelBuilder.Entity<LabTest>(entity =>
            {
                entity.HasKey(lt => lt.Id);
                entity.Property(lt => lt.Name).IsRequired().HasMaxLength(100);
                entity.Property(lt => lt.Price).HasColumnType("decimal(10,2)");
            });

            modelBuilder.Entity<LabOrder>(entity =>
            {
                entity.HasKey(lo => lo.Id);
                entity.Property(lo => lo.Status).IsRequired().HasMaxLength(20);
                entity.HasOne(lo => lo.Patient)
                    .WithMany()
                    .HasForeignKey(lo => lo.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(lo => lo.Doctor)
                    .WithMany()
                    .HasForeignKey(lo => lo.DoctorId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(lo => lo.LabTest)
                    .WithMany(lt => lt.LabOrders)
                    .HasForeignKey(lo => lo.LabTestId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(lo => lo.Appointment)
                    .WithMany()
                    .HasForeignKey(lo => lo.AppointmentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<LabResult>(entity =>
            {
                entity.HasKey(lr => lr.Id);
                entity.Property(lr => lr.Result).IsRequired();
                entity.HasOne(lr => lr.LabOrder)
                    .WithOne(lo => lo.LabResult)
                    .HasForeignKey<LabResult>(lr => lr.LabOrderId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(lr => lr.Technician)
                    .WithMany()
                    .HasForeignKey(lr => lr.TechnicianId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.HasKey(i => i.Id);
                entity.Property(i => i.TotalAmount).HasColumnType("decimal(10,2)");
                entity.Property(i => i.Status).IsRequired().HasMaxLength(20);
                entity.HasOne(i => i.Patient)
                    .WithMany()
                    .HasForeignKey(i => i.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(i => i.Appointment)
                    .WithMany()
                    .HasForeignKey(i => i.AppointmentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<InvoiceItem>(entity =>
            {
                entity.HasKey(ii => ii.Id);
                entity.Property(ii => ii.Description).IsRequired().HasMaxLength(200);
                entity.Property(ii => ii.Type).IsRequired().HasMaxLength(50);
                entity.Property(ii => ii.Amount).HasColumnType("decimal(10,2)");
                entity.HasOne(ii => ii.Invoice)
                    .WithMany(i => i.InvoiceItems)
                    .HasForeignKey(ii => ii.InvoiceId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

        }
    }
}