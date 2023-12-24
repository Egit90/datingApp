﻿using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Entities;
using API.Interface;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService : ITokenService
{
    // create a Symmetric key
    private readonly SymmetricSecurityKey _key;
    public TokenService(IConfiguration config)
    {
        var keyFromConfog = config["TokenKey"];
        if (string.IsNullOrEmpty(keyFromConfog))
        {
            throw new Exception("TokenKey is missing from configuration");
        }

        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyFromConfog));
    }


    public string CreateToken(AppUser user)
    {
        // create a claim 
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.NameId , user.Username)
        };

        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

        // Describe the token that we will return
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddDays(7),
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);

    }
}