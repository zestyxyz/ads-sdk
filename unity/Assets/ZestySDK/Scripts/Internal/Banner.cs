using SimpleJSON;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using UnityEngine;

namespace Zesty
{
    public class Ad {
        public string asset_url;
        public string cta_url;
    }
    public class BannerInfo {
        public List<Ad> Ads;
        public string CampaignId;
    }

    [ExecuteInEditMode]
    public class Banner : MonoBehaviour {
        public string adUnit;
        public string hostURL;
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
        string url;
        [DllImport("__Internal")] private static extern void _sendOnLoadMetric(string adUnitId, string campaignId);
        [DllImport("__Internal")] private static extern void _sendOnClickMetric(string adUnitId, string campaignId);
        [DllImport("__Internal")] private static extern void _open(string url);
        string bannerTextureURL;
        string campaignId = "";

        // Banner loading variables
        bool bannerLoadedSuccessfully = false;

        void Start() {
            m_Renderer = GetComponent<MeshRenderer>();
            m_Collider = GetComponent<MeshCollider>();
            FetchCampaignAd();
        }

        /// <summary>
        /// Fetches the active campaign ad, if one exists, from the ad server
        /// </summary>
        void FetchCampaignAd() {
            string url = $"{Constants.AD_SERVER_URL}/ad?ad_unit_id={adUnit}&url={hostURL}";
            string[] elmsKey = { "Ads", "CampaignId" };
            StartCoroutine(API.GetRequest(url, elmsKey, SetBannerInfo));
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
        /// Sets the active banner's texture and URL on the banner.
        /// Uses default values based on format if no banner info is present.
        /// </summary>
        /// <param name="bannerInfo">The Dictionary containing the active banner information.</param>
        public void SetBannerInfo(BannerInfo bannerInfo)
        {
            if (bannerInfo.CampaignId == "")
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
                SetURL($"https://www.zesty.xyz/");
            }
            else if (bannerInfo.Ads.Count > 0)
            {
                bannerTextureURL = bannerInfo.Ads[0].asset_url;
                StartCoroutine(API.GetTexture(bannerTextureURL, SetTexture));
                SetURL(bannerInfo.Ads[0].cta_url);
                campaignId = bannerInfo.CampaignId;
            }

            if (beaconEnabled)
            {
#if UNITY_EDITOR
#else
                // Fire onLoad signal to v1 beacon
                StartCoroutine(API.PutRequest(Constants.BEACON_URL + $"/space/{adUnit}", "onLoad"));
                // Fire increment mutation to v2 beacon
                _sendOnLoadMetric(adUnit, campaignId);
#endif
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
                StartCoroutine(API.PutRequest(Constants.BEACON_URL + $"/space/click/{adUnit}", "onClick"));
                // Fire increment mutation to v2 beacon
                _sendOnClickMetric(adUnit, campaignId);
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