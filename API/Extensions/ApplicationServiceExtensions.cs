using API.Data;
using API.Helpers;
using API.Interface;
using API.interfaces;
using API.Services;
using API.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<DataContext>(opt =>
        {
            opt.UseSqlite(config.GetConnectionString("DefaultConnection"));
        });
        services.AddCors();
        services.AddScoped<ITokenService, TokenService>();
        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        services.AddScoped<LogUserActivity>();
        services.Configure<CloudinarySettings>(config.GetSection("CloudinarySetting"));
        services.AddScoped<IPhotoService, PhotoService>();
        services.AddSingleton<PresenceTracker>();
        services.AddControllers();
        services.AddSwaggerGen();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddSignalR();

        return services;
    }
}
