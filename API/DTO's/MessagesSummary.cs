namespace API.DTOs;
public class MessagesSummary
{
    public int MemberId { get; set; }
    public string MemberName { get; set; } = null!;
    public string MemberPhotoUrl { get; set; } = null!;
    public DateTime? DateSentOrReceived { get; set; }
}