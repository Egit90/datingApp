using API.DTOs;
using API.Entities;
using API.Interface;
using API.interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;
[Authorize]
public class MessageHub(IUnitOfWork unitOfWork, IMapper mapper, IHubContext<PresenceHub> presenceHub) : Hub
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
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
        var messages = await _unitOfWork.MessageRepository
                            .GetMeassageThread(mainUser, otherUser!);

        if (_unitOfWork.HasChanges()) await _unitOfWork.Complete();


        await Clients.Group(groupName).SendAsync("ReceiveMessageThread", messages);
    }

    public async Task SendMessage(CreateMessageDto createMessageDto)
    {
        var username = Context.User?.GetUserName();

        if (username == createMessageDto.RecipientUserName.ToLower())
            throw new HubException("Cannot send messages to yourSelf");

        var sender = await _unitOfWork.UserRepository.GetUserByUsernameAsync(username!);
        var resipent = await _unitOfWork.UserRepository.GetUserByUsernameAsync(createMessageDto.RecipientUserName);

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
        var group = await _unitOfWork.MessageRepository.GetMessageGroup(groupName);

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

        _unitOfWork.MessageRepository.AddMessage(message);

        if (await _unitOfWork.Complete())
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
        var group = await _unitOfWork.MessageRepository.GetMessageGroup(groupName);
        var connection = new Connection(Context.ConnectionId, Context.User.GetUserName());

        if (group == null)
        {
            group = new Group(groupName);
            _unitOfWork.MessageRepository.AddGroup(group);
        }

        group.Connections.Add(connection);

        return await _unitOfWork.Complete();
    }

    private async Task RemoveFromMessageGroup()
    {
        var connection = await _unitOfWork.MessageRepository.GetConnection(Context.ConnectionId);
        _unitOfWork.MessageRepository.RemoveConnection(connection);
        await _unitOfWork.Complete();
    }


}