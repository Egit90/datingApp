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

    public void AddGroup(Group group)
    {
        _context.Groups.Add(group);
    }

    public void AddMessage(Message message)
    {
        _context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        _context.Messages.Remove(message);
    }

    public async Task<Connection> GetConnection(string connectionId)
    {
        return await _context.Connections.FindAsync(connectionId);
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
                            .OrderBy(m => m.MessageSent).ToListAsync();

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

    public async Task<Group> GetMessageGroup(string groupName)
    {
        return await _context.Groups
                    .Include(x => x.Connections)
                    .FirstOrDefaultAsync(x => x.Name == groupName);
    }

    public Task<PagedList<MessagesSummary>> GetUserMessageSummary(MessagesSummaryParams paginationParams)
    {
        var query = _context.Messages
        .OrderByDescending(x => x.MessageSent).AsQueryable();

        var q1 = query.Where(x => x.RecipientId == paginationParams.UserId).Select(x => x.SenderId).Distinct();
        var q2 = query.Where(x => x.SenderId == paginationParams.UserId).Select(x => x.RecipientId).Distinct();

        var combinedQuery = q1.Union(q2).ToList();

        var usersInCombinedQuery = _context.Users
            .Include(x => x.Photos)
            .Where(user => combinedQuery.Contains(user.Id))
            .Distinct();

        var res = usersInCombinedQuery.ProjectTo<MessagesSummary>(_mapper.ConfigurationProvider);

        return PagedList<MessagesSummary>.CreateAsync(res, paginationParams.PageNumber, paginationParams.PageSize);
    }

    public void RemoveConnection(Connection connection)
    {
        _context.Connections.Remove(connection);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }
}