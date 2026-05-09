namespace BreakingNewGround.Server.Models.Image
{
    public readonly record struct ImageProcessingResult()
    {
        public int Width { get; init; }

        public int Height { get; init; }

        public byte[] Thumbnail { get; init; } = [];

        public string ThumbnailContentType { get; init; } = string.Empty;
    }
}