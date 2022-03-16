using Ganss.XSS;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Encodings.Web;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using WebApp;

namespace Servicios
{
    public class CensorService
    {
        private readonly IOptionsSnapshot<GeneralOptions> options;

        public CensorService(IOptionsSnapshot<GeneralOptions> options)
        {
            this.options = options;
        }

        public bool BuscarPalabras(string contenido)
        {
            var CensoredWords = options.Value.PalabrasCensuradas.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            if (CensoredWords == null || CensoredWords.Count() == 0)
            {
                return false;
            }
            Censor censor = new Censor(CensoredWords);
            return censor.CensorText(contenido);
        }
    }

    public class Censor
    {
        public IList<string> CensoredWords { get; private set; }

        public Censor(IEnumerable<string> censoredWords)

        {
            CensoredWords = new List<string>(censoredWords);
        }

        public bool CensorText(string text)
        {
            if (text == null)
            {
                return false;
            }
            foreach (string censoredWord in CensoredWords)
            {
                string regularExpression = ToRegexPattern(censoredWord);
                if (Regex.IsMatch(text, regularExpression, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant))
                {
                    return true;
                }
            }
            return false;
        }

        private string ToRegexPattern(string wildcardSearch)
        {
            string regexPattern = Regex.Escape(wildcardSearch);
            regexPattern = regexPattern.Replace(@"\*", ".*?");
            regexPattern = regexPattern.Replace(@"\?", ".");
            if (regexPattern.StartsWith(".*?"))
            {
                regexPattern = regexPattern.Substring(3);
                regexPattern = @"\w*?" + regexPattern;
            }
            regexPattern = @"\b" + regexPattern + @"\b";
            return regexPattern;
        }
    }
}
