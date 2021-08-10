using SimpleJSON;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using UnityEngine;

namespace Zesty
{

    public class Ad : MonoBehaviour {
        public enum Formats
        {
            Tall,
            Wide,
            Square
        };

        public enum Network
        {
            Polygon,
            Rinkeby
        }
        
        public string adSpace;
        public string creator;
        public Network network;
        public Formats format;

        // Object-related variables
        Renderer m_Renderer;
        Texture m_Texture;
        private MeshCollider m_Collider;

        // Ad info
        string uri;
        string url;
        [DllImport("__Internal")] private static extern void _open(string url);
        string adTextureURL;

        // Ad loading variables
        bool adLoadedSuccessfuly = false;
        float adCheckTimer = 0f;
        float adCheckWaitPeriod = 10f;


        void Start () {
            m_Renderer = GetComponent<Renderer>();
            m_Collider = GetComponent<MeshCollider>();
            FetchNFT();
        }

        /// <summary>
        /// Queries The Graph for an NFT matching the specified adSpace and creator id with any active auctions.
        /// </summary>
        void FetchNFT() {
            string selectedNetwork = network == Network.Polygon ? Networks.POLYGON : Networks.RINKEBY;
            if (!string.IsNullOrEmpty(adSpace)) {
                string query = $@"
                    query {{
                      tokenDatas (
                        where: {{
                          id: ""{adSpace}""
                          creator: ""{creator}""
                        }}
                      ) {{
                        sellerNFTSetting {{
                          sellerAuctions (
                            first : 1
                            where: {{
                              contractTimeStart_lte: {Utils.GetCurrentUnixTime()}
                              contractTimeEnd_gte: {Utils.GetCurrentUnixTime()}
                            }}
                          ) {{
                              id
                              buyerCampaigns {{
                                id
                                uri
                              }}
                            }}
                        }}
                        id
                      }}
                    }}";

                JSONObject json = new JSONObject();

                json.Add("query", query);

                string[] elmsKey = { "uri" };
                StartCoroutine(API.PostRequest(selectedNetwork, json.ToString(), elmsKey, FetchActiveAd));
            }
        }

        void Update () {
            if (UnityEngine.Input.GetMouseButtonDown(0))
            {
                Ray ray = Camera.main.ScreenPointToRay(UnityEngine.Input.mousePosition);
                RaycastHit hit;
                if (m_Collider.Raycast(ray, out hit, 100))
                {
                    onClick();
                }
            }
        }

        /// <summary>
        /// Retrieves information from IPFS for the active auction on an adSpace.
        /// Sends null if no active auctions are found.
        /// </summary>
        /// <param name="adInfo">The Dictionary containing the NFT information.</param>
        public void FetchActiveAd(Dictionary<string, string> adInfo) {
            if (adInfo["uri"] != null) {                
                uri = $"https://ipfs.zesty.market/ipfs/{adInfo["uri"]}";
                string[] elmsKey = { "url", "image" };
                StartCoroutine(API.GetRequest(uri, elmsKey, SetAdInfo));
            }
            else
            {
                uri = null;
                string[] elmsKey = { "image" };
                StartCoroutine(API.GetRequest(uri, elmsKey, SetAdInfo));
            }
        }

        /// <summary>
        /// Sets the active ad's texture and URL on the banner.
        /// Uses default values based on format if no ad info is present.
        /// </summary>
        /// <param name="adInfo">The Dictionary containing the active ad information.</param>
        public void SetAdInfo(Dictionary<string, string> adInfo)
        {
            if (adInfo == null)
            {
                switch (format)
                {
                    case Formats.Tall:
                        StartCoroutine(API.GetTexture(Zesty.Formats.Tall.Image, SetTexture));
                        break;
                    case Formats.Wide:
                        StartCoroutine(API.GetTexture(Zesty.Formats.Wide.Image, SetTexture));
                        break;
                    case Formats.Square:
                    default:
                        StartCoroutine(API.GetTexture(Zesty.Formats.Square.Image, SetTexture));
                        break;
                }
                SetURL("https://www.zesty.market/");
            }
            else if (adInfo.ContainsKey("image"))
            {
                adTextureURL = $"https://ipfs.zesty.market/ipfs/{adInfo["image"]}";
                StartCoroutine(API.GetTexture(adTextureURL, SetTexture));
                SetURL(adInfo["url"]);
            }
        }

        /// <summary>
        /// Sets the texture on the ad.
        /// </summary>
        /// <param name="texture">The texture to set the ad to.</param>
        public void SetTexture(Texture texture) {
            if (texture != null) {
                m_Renderer.material.mainTexture = texture;
                adLoadedSuccessfuly = true;
            }
        }

        /// <summary>
        /// Sets the associated URL for the ad.
        /// Appends https:// if the given URL is bare.
        /// </summary>
        /// <param name="url">The URL to set on the ad.</param>
        public void SetURL(string url)
        {
            Regex urlMatch = new Regex(@"^http[s]?:\/\/");            
            url = urlMatch.Match(url).Success ? url : $"https://{url}";
            this.url = url;
        }

        /*public void GazingUpon () {
            isGazingUpon = true;
        }

        public void NotGazingUpon () {
            isGazingUpon = false;
        }*/

        public void onClick()
        {
            Debug.Log(url);
            _open(url);
        }
    }
}