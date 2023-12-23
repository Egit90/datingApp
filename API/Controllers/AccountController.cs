using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using API.Controllers;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interface;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API;
//api/account
public class AccountController(DataContext context, ITokenService tokenService) : BaseApiController
{
    private readonly DataContext _context = context;
    private readonly ITokenService _tokenService = tokenService;

    [HttpPost("register")] // /api/account/register
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await UserExists(registerDto.Username)) return BadRequest("Username is taken");

        using var hmac = new HMACSHA512();
        var user = new AppUser
        {
            Username = registerDto.Username.ToLower(),
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
            PasswordSalt = hmac.Key

        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Tocken = _tokenService.CreateToken(user),
            Username = registerDto.Username
        };
    }


    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var usr = await _context.Users.FirstOrDefaultAsync(e => e.Username == loginDto.Username);

        if (usr == null) return Unauthorized();

        using var hmac = new HMACSHA512(usr.PasswordSalt);
        var tmpHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

        if (tmpHash.SequenceEqual(usr.PasswordHash))
        {
            return new UserDto
            {
                Tocken = _tokenService.CreateToken(usr),
                Username = loginDto.Username
            };
        }

        return Unauthorized();
    }



    private async Task<bool> UserExists(string user)
    {
        return await _context.Users.AnyAsync(e => e.Username == user.ToLower());
    }


}
