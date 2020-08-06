using System;

namespace WebApp.Otros
{
    public static class DateTimeOffsetExtension
    {
        public static string RelativeString(this DateTimeOffset dateTimeOffset)
        {
            var d = dateTimeOffset.DateTime;
            // 1.
            // Get time span elapsed since the date.
            TimeSpan s = DateTime.Now.Subtract(d);

            // 2.
            // Get total number of days elapsed.
            int dayDiff = (int)s.TotalDays;

            // 3.
            // Get total number of seconds elapsed.
            int secDiff = (int)s.TotalSeconds;

            // 4.
            // Don't allow out of range values.
            if (dayDiff < 0)
            {
                return null;
            }

            // 5.
            // Handle same-day times.
            if (dayDiff == 0)
            {
                // A.
                // Less than one minute ago.
                if (secDiff < 60)
                {
                    return "0s";
                }
                // B.
                // Less than 2 minutes ago.
                if (secDiff < 120)
                {
                    return "1m";
                }
                // C.
                // Less than one hour ago.
                if (secDiff < 3600)
                {
                    return string.Format("{0}m",
                        Math.Floor((double)secDiff / 60));
                }
                // D.
                // Less than 2 hours ago.
                if (secDiff < 7200)
                {
                    return "1h";
                }
                // E.
                // Less than one day ago.
                if (secDiff < 86400)
                {
                    return string.Format("{0}h",
                        Math.Floor((double)secDiff / 3600));
                }
            }
            // 6.
            // Handle previous days.
            if (dayDiff == 1)
            {
                return "1d";
            }
            if (dayDiff < 7)
            {
                return string.Format("{0}d",
                    dayDiff);
            }
            if (dayDiff < 31)
            {
                return string.Format("{0}se",
                    Math.Ceiling((double)dayDiff / 7));
            }
            return string.Format("{0}ms",
                Math.Ceiling((double)dayDiff / 30));


        }
    }

}