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
        
        public struct Format
        {
            public Format(double width, double height, string image)
            {
                Width = width;
                Height = height;
                Image = image;
            }

            public double Width { get; }
            public double Height { get; }
            public string Image { get; }
        }

        public static Format Tall = new Format(0.75, 1, "https://ipfs.io/ipns/lib.zesty.market/assets/zesty-ad-tall.png");
        public static Format Wide = new Format(4, 1, "https://ipfs.io/ipns/lib.zesty.market/assets/zesty-ad-wide.png");
        public static Format Square = new Format(1, 1, "https://ipfs.io/ipns/lib.zesty.market/assets/zesty-ad-square.png");
    }
}
