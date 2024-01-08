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
        .ForMember(dest => dest.PhotoUrl, opt => opt.MapFrom(src => src.Photos.FirstOrDefault(x => x.IsMain).Url))
        .ForMember(des => des.Age, opt => opt.MapFrom(src => src.DateOfBirth.CalculateAge()))
        ;
        CreateMap<Photo, PhotoDto>();

        CreateMap<MemberUpdateDto, AppUser>();

        CreateMap<RegisterDto, AppUser>();

        CreateMap<Message, MessageDto>()
        .ForMember(dest => dest.SenderPhotoUrl, opt => opt.MapFrom(src => src.Sender.Photos.FirstOrDefault(x => x.IsMain).Url))
        .ForMember(dest => dest.RecipientPhotoUrl, opt => opt.MapFrom(src => src.Recipient.Photos.FirstOrDefault(x => x.IsMain).Url));


        CreateMap<AppUser, MessagesSummary>()
        .ForMember(dest => dest.MemberId, opt => opt.MapFrom(src => src.Id))
        .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.KnownAs))
        .ForMember(dest => dest.MemberPhotoUrl, opt => opt.MapFrom(src => src.Photos.FirstOrDefault(x => x.IsMain).Url));


        CreateMap<DateTime, DateTime>().ConvertUsing(d => DateTime.SpecifyKind(d, DateTimeKind.Utc));
        CreateMap<DateTime?, DateTime?>().ConvertUsing(
                                        d => d.HasValue ?
                                        DateTime.SpecifyKind(d.Value, DateTimeKind.Utc)
                                        : null
                                        );

    }
}
