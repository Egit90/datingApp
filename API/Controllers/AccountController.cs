using API.Controllers;
using API.DTOs;
using API.Entities;
using API.Interface;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API;
//api/account
public class AccountController(UserManager<AppUser> userManager, ITokenService tokenService, IMapper mapper) : BaseApiController
{
    private readonly UserManager<AppUser> _userManager = userManager;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IMapper _mapper = mapper;

    [HttpPost("register")] // /api/account/register
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await UserExists(registerDto.Username)) return BadRequest("Username is taken");

        var user = _mapper.Map<AppUser>(registerDto);

        if (user == null) return BadRequest("Something went wrong");

        user.UserName = registerDto.Username.ToLower();

        var res = await _userManager.CreateAsync(user, registerDto.Password);

        if (!res.Succeeded) return BadRequest(res.Errors);

        var roleResults = await _userManager.AddToRoleAsync(user, "Member");

        if (!roleResults.Succeeded) return BadRequest(roleResults.Errors);

        return new UserDto
        {
            Token = await _tokenService.CreateToken(user),
            Username = registerDto.Username,
            knownAs = user.KnownAs,
            Gender = user.Gender

        };
    }


    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var usr = await _userManager.Users
                        .Include(p => p.Photos)
                        .FirstOrDefaultAsync(e => e.UserName == loginDto.Username);

        if (usr == null) return Unauthorized("Invalid User");

        var res = await _userManager.CheckPasswordAsync(usr, loginDto.Password);

        if (!res) return Unauthorized();

        return new UserDto
        {
            Token = await _tokenService.CreateToken(usr),
            Username = loginDto.Username,
            PhotoUrl = usr.Photos.FirstOrDefault(x => x.IsMain)?.Url,
            knownAs = usr.KnownAs,
            Gender = usr.Gender
        };
    }




    private async Task<bool> UserExists(string user)
    {
        return await _userManager.Users.AnyAsync(e => e.UserName.ToLower() == user.ToLower());
    }


}
