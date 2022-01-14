namespace Zesty
{
    public class Formats
    {
        public enum Types
        {
            Tall,
            Wide,
            Square
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

        // Tall
        static string[] tallImages = {
            $"{Utils.getIPFSGateway()}/ipns/lib.zesty.market/assets/zesty-banner-tall.png",
            $"{Utils.getIPFSGateway()}/ipns/lib.zesty.market/assets/zesty-banner-tall-minimal.png",
            $"{Utils.getIPFSGateway()}/ipns/lib.zesty.market/assets/zesty-banner-tall-transparent.png",
        };
        public static Format Tall = new Format(0.75, 1, tallImages);

        // Wide
        static string[] wideImages = {
            $"{Utils.getIPFSGateway()}/ipns/lib.zesty.market/assets/zesty-banner-wide.png",
            $"{Utils.getIPFSGateway()}/ipns/lib.zesty.market/assets/zesty-banner-wide-minimal.png",
            $"{Utils.getIPFSGateway()}/ipns/lib.zesty.market/assets/zesty-banner-wide-transparent.png",
        };
        public static Format Wide = new Format(4, 1, wideImages);

        // Square
        static string[] squareImages = {
            $"{Utils.getIPFSGateway()}/ipns/lib.zesty.market/assets/zesty-banner-square.png",
            $"{Utils.getIPFSGateway()}/ipns/lib.zesty.market/assets/zesty-banner-square-minimal.png",
            $"{Utils.getIPFSGateway()}/ipns/lib.zesty.market/assets/zesty-banner-square-transparent.png",
        };
        public static Format Square = new Format(1, 1, squareImages);

    }
}