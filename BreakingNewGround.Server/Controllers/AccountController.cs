using BreakingNewGround.Server.DAL.AzureSQL.Data;
using BreakingNewGround.Server.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [SuppressMessage("ReSharper", "RouteTemplates.ActionRoutePrefixCanBeExtractedToControllerRoute")]
    public class AccountController : ControllerBase
    {
        private const string SECURITY_ALGORITHMS = SecurityAlgorithms.HmacSha512;
        private const int REFRESH_TOKEN_LIFETIME_IN_DAYS = 1;
        private readonly HybridCache _cache;
        private readonly IOptions<JwtSettings> _jwtSettings;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public AccountController(
            HybridCache cache,
            IOptions<JwtSettings> jwtSettings,
            SignInManager<ApplicationUser> signInManager,
            UserManager<ApplicationUser> userManager)
        {
            _cache = cache;
            _jwtSettings = jwtSettings;
            _signInManager = signInManager;
            _userManager = userManager;
        }

        [HttpPost]
        [Route("[action]")]
        public Task<IActionResult> Register(RegisterDto dto)
        {
            throw new NotImplementedException();

            /*var user = new ApplicationUser
            {
                UserName = dto.UserName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok();*/
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByNameAsync(dto.UserName);

            if (user is null)
            {
                return Unauthorized();
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);

            if (!result.Succeeded)
            {
                return Unauthorized();
            }

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.UserName!),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Value.Key));
            var creds = new SigningCredentials(key, SECURITY_ALGORITHMS);

            var accessToken = new JwtSecurityToken(
                _jwtSettings.Value.Issuer,
                _jwtSettings.Value.Audience,
                claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.Value.DurationInMinutes),
                signingCredentials: creds
            );

            var refreshToken = GenerateRefreshToken(user.UserName!);
            await SaveRefreshToken(refreshToken);

            Response.Cookies.Append("refreshToken", refreshToken.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(REFRESH_TOKEN_LIFETIME_IN_DAYS)
            });

            return Ok(new
            {
                accessToken = new JwtSecurityTokenHandler().WriteToken(accessToken)
            });
        }

        [HttpPost]
        [Route("[action]")]
        public async Task<IActionResult> UpdateAccessToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];
            
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return Unauthorized();
            }

            var principal = await ValidateRefreshToken(refreshToken);
            var userName = principal?.Claims.FirstOrDefault(x => x.Type == JwtRegisteredClaimNames.Sub)?.Value;

            if (userName is null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByNameAsync(userName);

            if (user is null)
            {
                return Unauthorized();
            }

            //var newAccessToken = GenerateJwt(user);

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.UserName!),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Value.Key));
            var creds = new SigningCredentials(key, SECURITY_ALGORITHMS);

            var token = new JwtSecurityToken(
                _jwtSettings.Value.Issuer,
                _jwtSettings.Value.Audience,
                claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.Value.DurationInMinutes),
                signingCredentials: creds
            );

            return Ok(new
            {
                accessToken = new JwtSecurityTokenHandler().WriteToken(token)
            });
        }

        private static RefreshToken GenerateRefreshToken(string userName)
        {
            var randomBytes = new byte[64];

            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }

            var token = WebEncoders.Base64UrlEncode(randomBytes);

            return new RefreshToken(
                token,
                userName,
                DateTime.UtcNow,
                DateTime.UtcNow.AddDays(REFRESH_TOKEN_LIFETIME_IN_DAYS));
        }

        private async Task SaveRefreshToken(RefreshToken refreshToken)
        {
            await _cache.SetAsync(refreshToken.Token, refreshToken,
                new HybridCacheEntryOptions
                {
                    Expiration = new TimeSpan(REFRESH_TOKEN_LIFETIME_IN_DAYS * TimeSpan.TicksPerDay)
                });
        }

        private async Task<RefreshToken> GetToken(string token)
        {
            return await _cache.GetOrCreateAsync(token, _ => new ValueTask<RefreshToken>());
        }

        private async Task<ClaimsPrincipal?> ValidateRefreshToken(string token)
        {
            var storedRefreshToken = await GetToken(token);

            if (storedRefreshToken.Expires <= DateTime.UtcNow)
            {
                return null;
            }

            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, storedRefreshToken.UserName),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var identity = new ClaimsIdentity(claims, JwtBearerDefaults.AuthenticationScheme);

            return new ClaimsPrincipal(identity);
        }
    }
}