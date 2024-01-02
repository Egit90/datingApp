using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interface;
using API.interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;
public class LikesController(IUserRepository userRepository, ILikesRepository likesRepository) : BaseApiController
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly ILikesRepository _likesRepository = likesRepository;

    [HttpPost("{username}")]
    public async Task<ActionResult> AddLike(string username)
    {
        var sourceUserId = User.GetUserID()!;
        var likedUser = await _userRepository.GetUserByUsernameAsync(username);
        var sourceUser = await _likesRepository.GetUserWithLikes(sourceUserId);

        if (likedUser == null) return NotFound();

        if (sourceUser!.Username == username) return BadRequest("Source User is Equl to Liked User");

        var userLike = await _likesRepository.GetUserLike(sourceUserId, likedUser.Id);

        if (userLike != null) return BadRequest("Like is already in DB");

        userLike = new UserLike
        {
            SourceUserId = sourceUserId,
            TargetUserId = likedUser.Id
        };

        sourceUser.LikedUsers.Add(userLike);
        if (await _userRepository.SaveAllAsync()) return Ok();

        return BadRequest("Falied to like User");
    }

    [HttpGet]
    public async Task<ActionResult<PagedList<LikeDto>>> GetUserLikes([FromQuery] LikesParams likesParams)
    {
        likesParams.UserId = User.GetUserID();
        var users = await _likesRepository.GetUserLikes(likesParams);

        Response.AddPaginationHeader(new PaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages));
        return Ok(users);
    }

}