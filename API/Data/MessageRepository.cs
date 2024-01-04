using API.DTOs;
using API.Entities;
using API.Helpers;
using API.interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;
public class MessageRepository(DataContext dataContext, IMapper mapper) : IMessageRepository
{
    private readonly DataContext _context = dataContext;
    private readonly IMapper _mapper = mapper;

    public void AddMessage(Message message)
    {
        _context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        _context.Messages.Remove(message);
    }

    public async Task<IEnumerable<MessageDto>> GetMeassageThread(string currentUsername, string recipientUserName)
    {
        var messages = await _context.Messages
                            .Include(u => u.Sender)
                            .ThenInclude(p => p.Photos)
                            .Include(u => u.Recipient)
                            .ThenInclude(p => p.Photos)
                            .Where(
                                m => m.RecipientUserName == currentUsername && m.SenderUserName == recipientUserName
                                || m.RecipientUserName == recipientUserName && m.SenderUserName == currentUsername
                            )
                            .OrderByDescending(m => m.MessageSent).ToListAsync();

        var unredMessages = messages.Where(m => m.DateRead == null && m.RecipientUserName == currentUsername).ToList();

        if (unredMessages.Any())
        {
            foreach (var message in unredMessages)
            {
                message.DateRead = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        return _mapper.Map<IEnumerable<MessageDto>>(messages);
    }

    public async Task<Message?> GetMessage(int id)
    {
        return await _context.Messages.FindAsync(id);

    }

    public Task<PagedList<MessageDto>> GetMessageForUser(MessageParams messageParams)
    {
        var query = _context.Messages.OrderByDescending(x => x.MessageSent).AsQueryable();

        query = messageParams.Container switch
        {
            "Inbox" => query.Where(x => x.RecipientUserName == messageParams.Username),
            "Outbox" => query.Where(x => x.SenderUserName == messageParams.Username),
            _ => query.Where(u => u.RecipientUserName == messageParams.Username && u.DateRead == null)
        };

        var messages = query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider);

        return PagedList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
    }

    public Task<PagedList<>>

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}