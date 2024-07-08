namespace Zesty
{
    public class Formats
    {
        public enum Types
        {
            MobilePhoneInterstitial,
            Billboard,
            MediumRectangle
        }

        public enum Styles
        {
            Standard,
            Minimal,
            Transparent
        }

        public struct Format
        {
            public Format(double width, double height, string[] images)
            {
                Width = width;
                Height = height;
                Images = images;
            }

            public double Width { get; }
            public double Height { get; }
            public string[] Images { get; }
        }

        // Moible Phone Interstitial
        static string[] mobilePhoneInterstitialImages = {
            $"{Constants.CDN_URL}/images/zesty/zesty-default-mobile-phone-interstitial.png",
        };
        public static Format MobilePhoneInterstitial = new Format(0.56, 1, mobilePhoneInterstitialImages);

        // Billboard
        static string[] billboardImages = {
            $"{Constants.CDN_URL}/images/zesty/zesty-default-billboard.png",
        };
        public static Format Billboard = new Format(3.88, 1, billboardImages);

        // Medium Rectangle
        static string[] mediumRectangleImages = {
            $"{Constants.CDN_URL}/images/zesty/zesty-default-medium-rectangle.png",
        };
        public static Format MediumRectangle = new Format(1.2, 1, mediumRectangleImages);

    }
}
