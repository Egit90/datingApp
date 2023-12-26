namespace API.DTOs;

public class MemberDto
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string PhotoUrl { get; set; } = null!;

    public int Age { get; set; }
    public string KnownAs { get; set; } = null!;
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime LastActive { get; set; } = DateTime.UtcNow;
    public string Gender { get; set; } = null!;
    public string Introduction { get; set; } = null!;
    public string LookingFor { get; set; } = null!;
    public string Interests { get; set; } = null!;
    public string City { get; set; } = null!;
    public string Country { get; set; } = null!;
    public List<PhotoDto> photos { get; set; }
}
