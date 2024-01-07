using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;
public class LikesRepository(DataContext dataContext) : ILikesRepository
{
    private readonly DataContext _context = dataContext;
    public async Task<UserLike?> GetUserLike(int sourceUserId, int targetUserID)
    {
        return await _context.Likes.FindAsync(sourceUserId, targetUserID);
    }

    public async Task<PagedList<LikeDto>> GetUserLikes(LikesParams likesParams)
    {
        var users = _context.Users.OrderBy(u => u.UserName).AsQueryable();
        var likes = _context.Likes.AsQueryable();

        if (likesParams.Predicate == "liked")
        {
            likes = likes.Where(like => like.SourceUserId == likesParams.UserId);
            users = likes.Select(like => like.TargetUser);
        }
        if (likesParams.Predicate == "likedBy")
        {
            likes = likes.Where(like => like.TargetUserId == likesParams.UserId);
            users = likes.Select(like => like.SourceUser);
        }

        var likedUsers = users.Select(user => new LikeDto
        {
            Age = user.DateOfBirth.CalculateAge(),
            City = user.City,
            KnownAs = user.KnownAs,
            Id = user.Id,
            PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain).Url,
            UserName = user.UserName
        });
        return await PagedList<LikeDto>.CreateAsync(likedUsers, likesParams.PageNumber, likesParams.PageSize);
    }

    public async Task<AppUser?> GetUserWithLikes(int userId)
    {
        return await _context.Users
                .Include(x => x.LikedUsers)
                .FirstOrDefaultAsync(x => x.Id == userId);
    }
}