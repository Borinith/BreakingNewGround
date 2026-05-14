using BreakingNewGround.Server.Models.Image;
using System.Threading;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Services
{
    public interface IImageProcessor
    {
        Task<ImageProcessingResult> ProcessAsync(byte[] originalBytes, CancellationToken cancellationToken);
    }
}