using API.DTOs;
using API.Entities;
using API.Extensions;
using AutoMapper;

namespace API.Helpers;

public class AutoMaapperProfiles : Profile
{
    public AutoMaapperProfiles()
    {
        CreateMap<AppUser, MemberDto>()
        .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(src => src.photos.FirstOrDefault(x => x.IsMain).Url))
        .ForMember(des => des.Age, opt => opt.MapFrom(src => src.DateOfBirth.CalculateAge()))
        ;
        CreateMap<Photo, PhotoDto>();
    }
}
