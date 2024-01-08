using API.DTOs;
using API.Entities;
using API.Interface;
using API.interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;
[Authorize]
public class MessageHub(IMessageRepository messageRepository, IUserRepository userRepository, IMapper mapper, IHubContext<PresenceHub> presenceHub) : Hub
{
    private readonly IMessageRepository _messageRepository = messageRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IMapper _mapper = mapper;
    private readonly IHubContext<PresenceHub> _presenceHub = presenceHub;

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var otherUser = httpContext?.Request.Query["user"];
        var mainUser = Context.User?.GetUserName();

        if (string.IsNullOrEmpty(otherUser) || string.IsNullOrEmpty(mainUser))
        {
            throw new HubException("user is empty");
        }

        var groupName = GetGroupName(mainUser, otherUser!);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        await AddToGroup(groupName);
        var messages = await _messageRepository
                            .GetMeassageThread(mainUser, otherUser!);

        await Clients.Group(groupName).SendAsync("ReceiveMessageThread", messages);
    }

    public async Task SendMessage(CreateMessageDto createMessageDto)
    {
        var username = Context.User?.GetUserName();

        if (username == createMessageDto.RecipientUserName.ToLower())
            throw new HubException("Cannot send messages to yourSelf");

        var sender = await _userRepository.GetUserByUsernameAsync(username!);
        var resipent = await _userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUserName);

        var SenderUserName = sender?.UserName;
        var resipentUserName = resipent?.UserName;

        if (resipent == null || SenderUserName == null || resipentUserName == null) throw new HubException("User was not found");

        var message = new Message
        {
            Sender = sender!,
            Recipient = resipent,
            SenderUserName = SenderUserName,
            RecipientUserName = resipentUserName,
            Content = createMessageDto.Content
        };

        var groupName = GetGroupName(SenderUserName, resipentUserName);
        var group = await _messageRepository.GetMessageGroup(groupName);

        if (group.Connections.Any(x => x.UserName == resipentUserName))
        {
            message.DateRead = DateTime.UtcNow;
        }
        else
        {
            var connections = await PresenceTracker.GetConnectionsForUser(resipentUserName);
            if (connections != null)
            {
                await _presenceHub.Clients.Clients(connections).SendAsync(
                                            "NewMessageReceived",
                                            new { username = SenderUserName, knownAs = sender?.KnownAs });
            }
        }

        _messageRepository.AddMessage(message);

        if (await _messageRepository.SaveAllAsync())
        {
            await Clients.Group(groupName).SendAsync("NewMessaage", _mapper.Map<Message, MessageDto>(message));
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await RemoveFromMessageGroup();
        await base.OnDisconnectedAsync(exception);
    }

    private string GetGroupName(string caller, string other)
    {
        var stringCompare = string.CompareOrdinal(caller, other) < 0;
        return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";

    }

    private async Task<bool> AddToGroup(string groupName)
    {
        var group = await _messageRepository.GetMessageGroup(groupName);
        var connection = new Connection(Context.ConnectionId, Context.User.GetUserName());

        if (group == null)
        {
            group = new Group(groupName);
            _messageRepository.AddGroup(group);
        }

        group.Connections.Add(connection);

        return await _messageRepository.SaveAllAsync();
    }

    private async Task RemoveFromMessageGroup()
    {
        var connection = await _messageRepository.GetConnection(Context.ConnectionId);
        _messageRepository.RemoveConnection(connection);
        await _messageRepository.SaveAllAsync();
    }


}