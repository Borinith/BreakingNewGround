using System;

namespace BreakingNewGround.Server.Models
{
    public record struct RefreshToken(string Token, string UserName, DateTime Created, DateTime Expires);
}