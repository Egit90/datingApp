using API.Interface;
using API.interfaces;
using AutoMapper;

namespace API.Data;
public class UnitOfWork(DataContext dataContext, IMapper mapper) : IUnitOfWork
{
    private readonly DataContext _dataContext = dataContext;
    private readonly IMapper _mapper = mapper;

    public IUserRepository UserRepository => new UserRepository(_dataContext, _mapper);

    public IMessageRepository MessageRepository => new MessageRepository(_dataContext, _mapper);

    public ILikesRepository LikesRepository => new LikesRepository(_dataContext);

    public async Task<bool> Complete()
    {
        return await _dataContext.SaveChangesAsync() > 0;
    }

    public bool HasChanges()
    {
        return _dataContext.ChangeTracker.HasChanges();
    }
}