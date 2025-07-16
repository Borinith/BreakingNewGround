namespace BreakingNewGround.Server.Models
{
    public record JwtSettings(string Key, string Issuer, string Audience, int DurationInMinutes);
}