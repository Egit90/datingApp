using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

[Authorize]
public class PresenceHub(PresenceTracker tracker) : Hub
{
    private readonly PresenceTracker _tracker = tracker;

    public override async Task OnConnectedAsync()
    {
        if (Context.User == null) return;
        var user = Context.User.GetUserName();

        if (user == null) return;

        var isOnline = await _tracker.UserConnected(user, Context.ConnectionId);

        if (isOnline) await Clients.Others.SendAsync("UserIsOnline", user);

        var currectUsers = await _tracker.GetOnlineUser();
        await Clients.Caller.SendAsync("GetOnlineUser", currectUsers);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.User == null) return;
        var user = Context.User.GetUserName();

        if (user == null) return;

        var isOffline = await _tracker.UserDisconnected(user, Context.ConnectionId);
        if (isOffline) await Clients.Others.SendAsync("UserIsOffline", user);

        await base.OnDisconnectedAsync(exception);
    }
}