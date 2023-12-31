using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AdminController(UserManager<AppUser> userManager) : BaseApiController
{
    private readonly UserManager<AppUser> _userManager = userManager;

    [Authorize(Policy = "RequireAdminRole")]
    [HttpGet("users-with-roles")]
    public async Task<ActionResult> GetUsersWithRoles()
    {
        var users = await _userManager.Users
                        .OrderBy(u => u.UserName)
                        .Select(u =>
                        new
                        {
                            u.Id,
                            UserName = u.UserName,
                            Roles = u.UserRoles.Select(e => e.Role.Name).ToList()
                        })
                        .ToListAsync();

        return Ok(users);
    }



    [Authorize(Policy = "RequireAdminRole")]
    [HttpPost("edit-roles/{username}")]
    public async Task<ActionResult> EditRoles(string username, [FromQuery] string roles)
    {

        if (string.IsNullOrEmpty(roles)) return BadRequest("No role was passed");

        var selectedRoles = roles.Split(",").ToArray();

        var user = await _userManager.FindByNameAsync(username);

        if (user == null) return NotFound();

        var userRoles = await _userManager.GetRolesAsync(user);

        var res = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));

        if (!res.Succeeded) return BadRequest("Failes");

        res = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));

        if (!res.Succeeded) return BadRequest("Failes");

        return Ok(await _userManager.GetRolesAsync(user));
    }

    [Authorize(Policy = "ModoratePhotoRole")]
    [HttpGet("photos-to-moderate")]
    public ActionResult GetPhotosForMoreration()
    {
        return Ok("Admins or Modorators");
    }

}