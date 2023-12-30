using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using API.Controllers;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interface;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API;
//api/account
public class AccountController(DataContext context, ITokenService tokenService, IMapper mapper) : BaseApiController
{
    private readonly DataContext _context = context;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IMapper _mapper = mapper;

    [HttpPost("register")] // /api/account/register
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await UserExists(registerDto.Username)) return BadRequest("Username is taken");


        var user = _mapper.Map<AppUser>(registerDto);

        if (user == null) return BadRequest("Something went wrong");

        using var hmac = new HMACSHA512();
        user.Username = registerDto.Username.ToLower();
        user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password));
        user.PasswordSalt = hmac.Key;


        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Token = _tokenService.CreateToken(user),
            Username = registerDto.Username,
            knownAs = user.KnownAs
        };
    }


    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var usr = await _context.Users.Include(p => p.Photos).FirstOrDefaultAsync(e => e.Username == loginDto.Username);

        if (usr == null) return Unauthorized();

        using var hmac = new HMACSHA512(usr.PasswordSalt);
        var tmpHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

        if (tmpHash.SequenceEqual(usr.PasswordHash))
        {
            return new UserDto
            {
                Token = _tokenService.CreateToken(usr),
                Username = loginDto.Username,
                PhotoUrl = usr.Photos.FirstOrDefault(x => x.IsMain)?.Url,
                knownAs = usr.KnownAs
            };
        }

        return Unauthorized();
    }



    private async Task<bool> UserExists(string user)
    {
        return await _context.Users.AnyAsync(e => e.Username.ToLower() == user.ToLower());
    }


}
