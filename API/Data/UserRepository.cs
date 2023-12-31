using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interface;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class UserRepository(DataContext context, IMapper mapper) : IUserRepository
{
    private readonly DataContext _context = context;
    private readonly IMapper _mapper = mapper;

    public async Task<MemberDto?> GetMemberAsync(string name)
    {
        return await _context.Users
           .Where(x => x.Username == name)
           .ProjectTo<MemberDto>(_mapper.ConfigurationProvider)
           .SingleOrDefaultAsync();
    }

    public async Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams)
    {
        var query = _context.Users.AsQueryable();
        query = query.Where(x => x.Username != userParams.CurrentUserName);
        query = query.Where(x => x.Gender == userParams.Gender);

        var minDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-userParams.MaxAge - 1));
        var maxDob = DateOnly.FromDateTime(DateTime.Today.AddYears(-userParams.MinAge));

        query = query.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);

        return await PagedList<MemberDto>.CreateAsync(
              query.AsNoTracking()
              .ProjectTo<MemberDto>(_mapper.ConfigurationProvider),
              userParams.PageNumber, userParams.PageSize);
    }

    public async Task<IEnumerable<AppUser>> GetUserAsync()
    {
        return await _context.Users.Include(e => e.Photos).ToListAsync();
    }

    public async Task<AppUser?> GetUserByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<AppUser?> GetUserByUsernameAsync(string name)
    {
        return await _context.Users
        .Include(p => p.Photos)
        .SingleOrDefaultAsync(x => x.Username == name);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _context.SaveChangesAsync() > 0;
    }

    public void UpdateAsync(AppUser user)
    {
        _context.Entry(user).State = EntityState.Modified;
    }
}
