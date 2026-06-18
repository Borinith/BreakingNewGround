using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using System;

namespace BreakingNewGround.Server.Attributes
{
    /// <summary>
    /// Аналог [ResponseCache], но добавляет директиву immutable (браузер не ревалидирует ресурс даже при перезагрузке)
    /// </summary>
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
    public sealed class ImmutableResponseCacheAttribute : ActionFilterAttribute
    {
        public int Duration { get; set; }

        public ResponseCacheLocation Location { get; set; } = ResponseCacheLocation.Any;

        public override void OnResultExecuting(ResultExecutingContext context)
        {
            // Заголовок ставим только для успешных ответов - иначе закэшируем, например, 404.
            var statusCode = (context.Result as IStatusCodeActionResult)?.StatusCode ?? StatusCodes.Status200OK;

            if (statusCode is >= 200 and < 300)
            {
                var visibility = Location == ResponseCacheLocation.Any ? "public" : (Location == ResponseCacheLocation.Client ? "private" : "no-cache");

                context.HttpContext.Response.Headers.CacheControl = $"{visibility}, max-age={Duration}, immutable";
            }

            base.OnResultExecuting(context);
        }
    }
}