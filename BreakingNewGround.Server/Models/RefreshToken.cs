using System;

namespace BreakingNewGround.Server.Models
{
    public readonly record struct RefreshToken(string Token, string UserName, DateTime Created, DateTime Expires);
}