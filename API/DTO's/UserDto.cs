
namespace API;

public class UserDto
{
    public required string Username { get; set; }
    public required string Token { get; set; }

    public string PhotoUrl { get; set; } = null!;
    public string knownAs { get; set; } = null!;
    public string Gender { get; set; }

}