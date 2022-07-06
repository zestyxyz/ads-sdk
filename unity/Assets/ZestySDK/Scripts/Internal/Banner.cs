using SimpleJSON;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using UnityEngine;

namespace Zesty
{
    [ExecuteInEditMode]
    public class Banner : MonoBehaviour {
        public enum Network
        {
            Polygon,
            Rinkeby
        }

        public string space;
        public Network network;
        public Formats.Types format;
        public Formats.Styles style;
        public bool beaconEnabled = true;

        public Material[] placeholderMaterials = new Material[3];
        public Material runtimeBanner;

        // Object-related variables
        MeshRenderer m_Renderer;
        Texture m_Texture;
        private MeshCollider m_Collider;

        // Banner info
        string uri;
        string url;
        [DllImport("__Internal")] private static extern void _sendOnLoadMetric(string spaceId);
        [DllImport("__Internal")] private static extern void _sendOnClickMetric(string spaceId);
        [DllImport("__Internal")] private static extern void _open(string url);
        string bannerTextureURL;

        // Banner loading variables
        bool bannerLoadedSuccessfully = false;

        void Start() {
            m_Renderer = GetComponent<MeshRenderer>();
            m_Collider = GetComponent<MeshCollider>();
            FetchNFT();
            if (beaconEnabled)
            {
#if UNITY_EDITOR
#else
                // Fire onLoad signal to v1 beacon
                StartCoroutine(API.PutRequest(Constants.BEACON_URL + $"/space/{space}", "onLoad"));
                // Fire increment mutation to v2 beacon
                _sendOnLoadMetric(space);
#endif
            }
        }

        /// <summary>
        /// Queries The Graph for an NFT matching the specified space with any active auctions.
        /// </summary>
        void FetchNFT() {
            string selectedNetwork = network == Network.Polygon ? Networks.POLYGON : Networks.RINKEBY;
            if (!string.IsNullOrEmpty(space)) {
                string query = $@"
                    query {{
                      tokenDatas (
                        where: {{
                          id: ""{space}""
                        }}
                      ) {{
                        sellerNFTSetting {{
                          sellerAuctions (
                            first : 5
                            where: {{
                              contractTimeStart_lte: {Utils.GetCurrentUnixTime()}
                              contractTimeEnd_gte: {Utils.GetCurrentUnixTime()}
                              cancelled: false
                            }}
                          ) {{
                              id
                              buyerCampaigns {{
                                id
                                uri
                              }}
                              buyerCampaignsApproved
                            }}
                        }}
                        id
                      }}
                    }}";

                JSONObject json = new JSONObject();

                json.Add("query", query);

                string[] elmsKey = { "uri" };
                StartCoroutine(API.PostRequest(selectedNetwork, json.ToString(), elmsKey, FetchActiveBanner));
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

            // Editor resizing
            if (transform.hasChanged && !Application.isPlaying)
            {
                UpdateBanner();
            }
        }

        /// <summary>
        /// Retrieves information from IPFS for the active auction on an space.
        /// Sends null if no active auctions are found.
        /// </summary>
        /// <param name="bannerInfo">The Dictionary containing the NFT information.</param>
        public void FetchActiveBanner(Dictionary<string, string> bannerInfo) {
            if (bannerInfo["uri"] != null) {                
                uri = Utils.ParseProtocol(bannerInfo["uri"]);
                string[] elmsKey = { "url", "image" };
                StartCoroutine(API.GetRequest(uri, elmsKey, SetBannerInfo));
            }
            else
            {
                uri = null;
                string[] elmsKey = { "image" };
                StartCoroutine(API.GetRequest(uri, elmsKey, SetBannerInfo));
            }
        }

        /// <summary>
        /// Sets the active banner's texture and URL on the banner.
        /// Uses default values based on format if no banner info is present.
        /// </summary>
        /// <param name="bannerInfo">The Dictionary containing the active banner information.</param>
        public void SetBannerInfo(Dictionary<string, string> bannerInfo)
        {
            if (bannerInfo == null)
            {
                switch (format)
                {
                    case Formats.Types.Tall:
                        StartCoroutine(API.GetTexture(Formats.Tall.Images[(int)style], SetTexture));
                        break;
                    case Formats.Types.Wide:
                        StartCoroutine(API.GetTexture(Formats.Wide.Images[(int)style], SetTexture));
                        break;
                    case Formats.Types.Square:
                    default:
                        StartCoroutine(API.GetTexture(Formats.Square.Images[(int)style], SetTexture));
                        break;
                }
                SetURL($"https://app.zesty.market/space/{space}");
            }
            else if (bannerInfo.ContainsKey("image"))
            {
                bannerTextureURL = Utils.ParseProtocol(bannerInfo["image"]);
                StartCoroutine(API.GetTexture(bannerTextureURL, SetTexture));
                SetURL(bannerInfo["url"]);
            }
        }

        /// <summary>
        /// Sets the texture on the banner.
        /// </summary>
        /// <param name="texture">The texture to set the banner to.</param>
        public void SetTexture(Texture texture) {
            if (texture != null) {
                Material bannerMaterial = new Material(runtimeBanner);
                m_Renderer.sharedMaterial = bannerMaterial;
                bannerMaterial.mainTexture = texture;
                bannerLoadedSuccessfully = true;
            }
        }

        /// <summary>
        /// Sets the associated URL for the banner.
        /// Appends https:// if the given URL is bare.
        /// </summary>
        /// <param name="url">The URL to set on the banner.</param>
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
            if (Application.platform == RuntimePlatform.WebGLPlayer)
                _open(url);            
            else            
                Application.OpenURL(url);

            if (beaconEnabled)
            {
                // Fire onClick signal to beacon
                StartCoroutine(API.PutRequest(Constants.BEACON_URL + $"/space/click/{space}", "onClick"));
                // Fire increment mutation to v2 beacon
                _sendOnClickMetric(space);
            }      
        }

        private void OnValidate()
        {
            UpdateBanner();
        }

        /// <summary>
        /// Scales the banner and sets its material based on the currently active format.
        /// </summary>
        private void UpdateBanner()
        {
            switch (format)
            {
                case Formats.Types.Tall:
                    transform.localScale = new Vector3(transform.localScale.x, (float)(transform.localScale.x * (4f / 3f)), .001f);
                    gameObject.GetComponent<Renderer>().material = placeholderMaterials[0];
                    break;
                case Formats.Types.Wide:
                    transform.localScale = new Vector3(transform.localScale.x, transform.localScale.x / 4, .001f);
                    gameObject.GetComponent<Renderer>().material = placeholderMaterials[1];
                    break;
                case Formats.Types.Square:
                    transform.localScale = new Vector3(transform.localScale.x, transform.localScale.x, .001f);
                    gameObject.GetComponent<Renderer>().material = placeholderMaterials[2];
                    break;
            }

        }
    }
}