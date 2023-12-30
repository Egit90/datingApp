using System.Security.Claims;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interface;
using AutoMapper;
using AutoMapper.Execution;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class UsersController(IUserRepository userRepository, IMapper mapper, IPhotoService photoService) : BaseApiController
{

    private readonly IUserRepository _userRepository = userRepository;
    private readonly IMapper _mapper = mapper;
    private readonly IPhotoService _photoService = photoService;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
    {
        var users = await _userRepository.GetMembersAsync();
        return Ok(users);
    }

    [HttpGet("{username}")] // /api/users/2
    public async Task<ActionResult<MemberDto?>> GetOneUser(string username)
    {
        return await _userRepository.GetMemberAsync(username);
    }

    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
    {
        var username = User.GetUserName();
        if (username == null) return NotFound();

        var user = await _userRepository.GetUserByUsernameAsync(username);
        if (user == null) return NotFound();

        _mapper.Map(memberUpdateDto, user);

        if (await _userRepository.SaveAllAsync()) return NoContent();

        return BadRequest("Failed To Update User");
    }

    [HttpPost("add-photo")]
    public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
    {
        var username = User.GetUserName();
        if (username == null) return NotFound();

        var user = await _userRepository.GetUserByUsernameAsync(username);
        if (user == null) return NotFound();

        var results = await _photoService.AddPhotoAsync(file);

        if (results.Error != null)
        {
            return BadRequest(results.Error.Message);
        }

        var photo = new Photo
        {
            Url = results.SecureUrl.AbsoluteUri,
            PublicId = results.PublicId
        };

        if (user.Photos.Count == 0) photo.IsMain = true;

        user.Photos.Add(photo);


        if (await _userRepository.SaveAllAsync())
        {
            return CreatedAtAction(nameof(GetUsers), new { username = user.Username }, _mapper.Map<PhotoDto>(photo));
        }
        return BadRequest("Problem adding Photo");
    }

    [HttpPut("set-main-photo/{photoId}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {
        var username = User.GetUserName();
        if (username == null) return NotFound();

        var user = await _userRepository.GetUserByUsernameAsync(username);
        if (user == null) return NotFound();

        var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

        if (photo == null) return NotFound();
        if (photo.IsMain) return BadRequest("this is already your main photo.");

        var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);
        if (currentMain != null) currentMain.IsMain = false;

        photo.IsMain = true;

        if (await _userRepository.SaveAllAsync()) return NoContent();

        return BadRequest("problem Setting main photo");

    }

    [HttpDelete("delete-photo/{photoId}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {

        var username = User.GetUserName();
        if (username == null) return NotFound();

        var user = await _userRepository.GetUserByUsernameAsync(username);
        if (user == null) return NotFound();

        var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
        if (photo == null) return NotFound();

        if (photo.IsMain) return BadRequest("Cannot delete main photo");

        if (photo.PublicId != null)
        {
            var res = await _photoService.DeletePhotoAsync(photo.PublicId);
            if (res.Error != null) return BadRequest(res.Error.Message);
        }


        user.Photos.Remove(photo);

        if (await _userRepository.SaveAllAsync()) return NoContent();

        return BadRequest("error deleting the file");
    }
}