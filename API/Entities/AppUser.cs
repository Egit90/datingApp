using System.ComponentModel.DataAnnotations;
using API.Extensions;

namespace API.Entities;

public class AppUser
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;

    public byte[] PasswordHash { get; set; } = null!;
    public byte[] PasswordSalt { get; set; } = null!;

    public DateOnly DateOfBirth { get; set; }
    public string KnownAs { get; set; } = null!;
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime LastActive { get; set; } = DateTime.UtcNow;
    public string Gender { get; set; } = null!;
    public string? Introduction { get; set; }
    public string? LookingFor { get; set; }
    public string? Interests { get; set; }
    public string City { get; set; } = null!;
    public string Country { get; set; } = null!;
    public List<Photo> Photos { get; set; } = [];

    public List<UserLike> LikedByUsers { get; set; }
    public List<UserLike> LikedUsers { get; set; }


    public List<Message> MessagesSent { get; set; }
    public List<Message> MessagesReceived { get; set; }
}
