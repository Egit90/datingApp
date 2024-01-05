using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interface;
using API.interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;
public class MessagesController(IUserRepository userRepository, IMessageRepository messageRepository, IMapper mapper) : BaseApiController
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IMessageRepository _messageRepository = messageRepository;
    private readonly IMapper _mapper = mapper;


    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var username = User.GetUserName();
        if (username == createMessageDto.RecipientUserName.ToLower())
            return BadRequest("Cannot send a message for yourself");

        var sender = await _userRepository.GetUserByUsernameAsync(username!);
        var resipent = await _userRepository.GetUserByUsernameAsync(createMessageDto.RecipientUserName);

        if (resipent == null) return NotFound();

        var message = new Message
        {
            Sender = sender!,
            Recipient = resipent,
            SenderUserName = sender!.Username,
            RecipientUserName = resipent.Username,
            Content = createMessageDto.Content
        };

        _messageRepository.AddMessage(message);

        if (await _messageRepository.SaveAllAsync()) return Ok(_mapper.Map<Message, MessageDto>(message));

        return BadRequest("Failed To send mssage");
    }


    [HttpGet]
    public async Task<ActionResult<PagedList<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams)
    {
        messageParams.Username = User.GetUserName()!;

        var messages = await _messageRepository.GetMessageForUser(messageParams);

        Response.AddPaginationHeader(new PaginationHeader(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalPages));

        return messages;

    }

    [HttpGet("summary")]
    public async Task<ActionResult<PagedList<MessagesSummary>>> GetMessagesSummary([FromQuery] MessagesSummaryParams paginationParams)
    {
        paginationParams.UserId = User.GetUserID();

        var res = await _messageRepository.GetUserMessageSummary(paginationParams);

        Response.AddPaginationHeader(new PaginationHeader(res.CurrentPage, res.PageSize, res.TotalCount, res.TotalPages));

        return res;
    }

    [HttpGet("thread/{username}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username)
    {
        var currentUsername = User.GetUserName();
        return Ok(await _messageRepository.GetMeassageThread(currentUsername, username));
    }

}