namespace API.DTOs;
public class MessageDto
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public string SenderUserName { get; set; } = null!;
    public string SenderPhotoUrl { get; set; } = null!;
    public int RecipientId { get; set; }
    public string RecipientUserName { get; set; } = null!;
    public string RecipientPhotoUrl { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime? DateRead { get; set; }
    public DateTime? MessageSent { get; set; }
}