using BreakingNewGround.Server.DAL.AzureSQL.Data;
using Konscious.Security.Cryptography;
using Microsoft.AspNetCore.Identity;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace BreakingNewGround.Server.Services
{
    /// <summary>
    /// Хэшируем пароли через Argon2id (OWASP-рекомендуемые параметры)
    /// </summary>
    public class Argon2idPasswordHasherService : IPasswordHasher<ApplicationUser>
    {
        private const int MemoryKb = 19_456;       // 19 MiB
        private const int Iterations = 2;
        private const int DegreeOfParallelism = 1;
        private const int SaltLength = 16;         // 128 bit
        private const int HashLength = 32;         // 256 bit

        public string HashPassword(ApplicationUser user, string password)
        {
            var salt = RandomNumberGenerator.GetBytes(SaltLength);
            var hash = ComputeHash(password, salt, MemoryKb, Iterations, DegreeOfParallelism, HashLength);

            return FormatPhc(salt, hash, MemoryKb, Iterations, DegreeOfParallelism);
        }

        public PasswordVerificationResult VerifyHashedPassword(ApplicationUser user, string hashedPassword, string providedPassword)
        {
            if (string.IsNullOrWhiteSpace(hashedPassword))
            {
                return PasswordVerificationResult.Failed;
            }

            return VerifyArgon2id(hashedPassword, providedPassword);
        }

        private static PasswordVerificationResult VerifyArgon2id(string phcString, string password)
        {
            // Формат: $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>
            var parts = phcString.Split('$');

            if (parts.Length != 6 || parts[1] != "argon2id")
            {
                return PasswordVerificationResult.Failed;
            }

            try
            {
                var paramsDict = parts[3]
                    .Split(',')
                    .Select(p => p.Split('='))
                    .ToDictionary(p => p[0], p => int.Parse(p[1]));

                var memory = paramsDict["m"];
                var iterations = paramsDict["t"];
                var parallelism = paramsDict["p"];

                var salt = Convert.FromBase64String(PadBase64(parts[4]));
                var expectedHash = Convert.FromBase64String(PadBase64(parts[5]));

                var actualHash = ComputeHash(password, salt, memory, iterations, parallelism, expectedHash.Length);

                if (!CryptographicOperations.FixedTimeEquals(actualHash, expectedHash))
                {
                    return PasswordVerificationResult.Failed;
                }

                // Если параметры не совпадают с текущими дефолтами — просим Identity перехэшировать
                var parametersOutdated =
                    memory != MemoryKb ||
                    iterations != Iterations ||
                    parallelism != DegreeOfParallelism;

                return parametersOutdated
                    ? PasswordVerificationResult.SuccessRehashNeeded
                    : PasswordVerificationResult.Success;
            }
            catch (Exception)
            {
                return PasswordVerificationResult.Failed;
            }
        }

        private static byte[] ComputeHash(string password, byte[] salt, int memoryKb, int iterations, int parallelism, int hashLength)
        {
            using var argon2id = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                MemorySize = memoryKb,
                Iterations = iterations,
                DegreeOfParallelism = parallelism
            };

            return argon2id.GetBytes(hashLength);
        }

        private static string FormatPhc(byte[] salt, byte[] hash, int memoryKb, int iterations, int parallelism)
        {
            var saltB64 = Convert.ToBase64String(salt).TrimEnd('=');
            var hashB64 = Convert.ToBase64String(hash).TrimEnd('=');

            return $"$argon2id$v=19$m={memoryKb},t={iterations},p={parallelism}${saltB64}${hashB64}";
        }

        private static string PadBase64(string value)
        {
            var padding = (4 - value.Length % 4) % 4;

            return padding > 0 ? value + new string('=', padding) : value;
        }
    }
}