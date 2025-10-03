namespace BreakingNewGround.Server
{
    public static class Utils
    {
        /// <summary>
        ///     Protection from SQL injection attacks
        /// </summary>
        /// <param name="name"></param>
        /// <returns></returns>
        public static string ToQuoted(this string name)
        {
            return $"[{name.Replace("]", "]]")}]";
        }
    }
}