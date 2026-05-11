using BreakingNewGround.Server.Models.Image;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Bmp;
using SixLabors.ImageSharp.Formats.Gif;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Tiff;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Services
{
    public class ImageProcessor : IImageProcessor
    {
        private const int ThumbnailMaxWidth = 300;
        private const int JpegQuality = 70;

        public async Task<ImageProcessingResult> ProcessAsync(byte[] originalBytes, CancellationToken cancellationToken)
        {
            using var inputStream = new MemoryStream(originalBytes);
            using var image = await Image.LoadAsync(inputStream, cancellationToken);

            var (encoder, contentType) = SelectThumbnailEncoder(image.Metadata.DecodedImageFormat);

            int originalWidth = image.Width;
            int originalHeight = image.Height;

            int targetWidth = originalWidth <= ThumbnailMaxWidth ? originalWidth : ThumbnailMaxWidth;

            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(targetWidth, 0),
                Mode = ResizeMode.Max
            }));

            using var outputStream = new MemoryStream();

            await image.SaveAsync(outputStream, encoder, cancellationToken);

            return new ImageProcessingResult
            {
                Width = originalWidth,
                Height = originalHeight,
                Thumbnail = outputStream.ToArray(),
                ThumbnailContentType = contentType
            };
        }

        private static (IImageEncoder Encoder, string ContentType) SelectThumbnailEncoder(IImageFormat? format)
        {
            return format switch
            {
                GifFormat => (new GifEncoder(), "image/gif"),
                PngFormat => (new PngEncoder(), "image/png"),
                WebpFormat => (new WebpEncoder { Quality = JpegQuality }, "image/webp"),
                JpegFormat => (new JpegEncoder { Quality = JpegQuality }, "image/jpeg"),
                BmpFormat => (new JpegEncoder { Quality = JpegQuality }, "image/jpeg"),
                TiffFormat => (new JpegEncoder { Quality = JpegQuality }, "image/jpeg"),
                _ => (new JpegEncoder { Quality = JpegQuality }, "image/jpeg")
            };
        }
    }
}