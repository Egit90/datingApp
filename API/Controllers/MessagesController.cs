using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interface;
using API.interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;
public class MessagesController(IUnitOfWork unitOfWork, IMapper mapper) : BaseApiController
{
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IMapper _mapper = mapper;

    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var username = User.GetUserName();
        if (username == createMessageDto.RecipientUserName.ToLower())
            return BadRequest("Cannot send a message for yourself");

        var sender = await _unitOfWork.UserRepository.GetUserByUsernameAsync(username!);
        var resipent = await _unitOfWork.UserRepository.GetUserByUsernameAsync(createMessageDto.RecipientUserName);

        if (resipent == null) return NotFound();

        var message = new Message
        {
            Sender = sender!,
            Recipient = resipent,
            SenderUserName = sender!.UserName,
            RecipientUserName = resipent.UserName,
            Content = createMessageDto.Content
        };

        _unitOfWork.MessageRepository.AddMessage(message);

        if (await _unitOfWork.Complete()) return Ok(_mapper.Map<Message, MessageDto>(message));

        return BadRequest("Failed To send mssage");
    }


    [HttpGet]
    public async Task<ActionResult<PagedList<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams)
    {
        messageParams.Username = User.GetUserName()!;

        var messages = await _unitOfWork.MessageRepository.GetMessageForUser(messageParams);

        Response.AddPaginationHeader(new PaginationHeader(messages.CurrentPage, messages.PageSize, messages.TotalCount, messages.TotalPages));

        return messages;

    }

    [HttpGet("summary")]
    public async Task<ActionResult<PagedList<MessagesSummary>>> GetMessagesSummary([FromQuery] MessagesSummaryParams paginationParams)
    {
        paginationParams.UserId = User.GetUserID();

        var res = await _unitOfWork.MessageRepository.GetUserMessageSummary(paginationParams);

        Response.AddPaginationHeader(new PaginationHeader(res.CurrentPage, res.PageSize, res.TotalCount, res.TotalPages));

        return res;
    }

}