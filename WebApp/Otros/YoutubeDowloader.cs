using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Flurl.Http;
using Flurl;
using System.Collections.Generic;
using System;

namespace WebApp
{
    public class YoutubeDownloader
    {
        static readonly Dictionary<string, (DateTimeOffset, string)> cache = new Dictionary<string, (DateTimeOffset, string)>();

        static public async Task<string> GenerarLinkDeDescarga(string link)
        {
            var videoId = GetYoutubeId(link);

            if( cache.ContainsKey(videoId) &&
                cache.GetValueOrDefault(videoId).Item1 > DateTimeOffset.Now.AddMinutes(-10))
            {
                return cache.GetValueOrDefault(videoId).Item2;
            }

            var res = await "https://www.y2mate.com/mates/es/analyze/ajax".PostUrlEncodedAsync(new
            {
                url = $"https://www.youtube.com/watch?v={videoId}",
                q_auto = "1",
                ajax = "1",
            });

            var ajax = await res.GetJsonAsync<AjaxResponse>();
            var id = GetId(ajax.Result);
            var resolucion = GetResolucion(ajax.Result);

            res = await "https://www.y2mate.com/mates/es/convert".PostUrlEncodedAsync(new
            {
                type = "youtube",
                _id = id,
                v_id = videoId,
                ajax = "1",
                token = "",
                ftype = "mp4",
                fquality = resolucion,
            });
            ajax = await res.GetJsonAsync<AjaxResponse>();

            string linkDescarga = GetLink(ajax.Result);

            if(string.IsNullOrWhiteSpace(linkDescarga)) return "";

            cache[videoId] = (DateTimeOffset.Now, linkDescarga);

            return GetLink(ajax.Result);
        }

        static private string GetId(string result)
        {
            return Regex.Match(result, @"k__id = \""([a-z0-9]+)").Groups[1].Value;
        }
        static private string GetResolucion(string result)
        {
            string ret = Regex.Match(result, @"data\-fquality=\""((720|480|360|240|144)p?)").Groups[1].Value;
            return ret;
        }
        static private string GetLink(string result)
        {
            return Regex.Match(result, @"href=\""(.*)"" rel").Groups[1].Value; ;
        }
        static private string GetYoutubeId(string link)
        {
            return Regex.Match(link, @"(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v\=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})")
                .Groups[1].Value;
        }

        private class AjaxResponse
        {
            public string Status { get; set; }
            public string Result { get; set; }
        }

    }

}