using Backend.DTOs;

public class NurseDashboardDto
{
    public int TotalAdmittedPatients { get; set; }

    public int TotalBeds { get; set; }
    public int AvailableBeds { get; set; }

    public List<WardResponseDto> Wards { get; set; } = new List<WardResponseDto>();
}