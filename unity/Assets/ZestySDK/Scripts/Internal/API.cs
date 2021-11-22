using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using SimpleJSON;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.SceneManagement;

namespace Zesty {
    public class API : MonoBehaviour {
        private static readonly int timeoutSeconds = 3;

        public static bool CheckAPIStatusSync() {
            using (UnityWebRequest request = UnityWebRequest.Get(Constants.BEACON_URL)) {
                DateTime dateTime = DateTime.UtcNow.AddSeconds(timeoutSeconds);

                request.SendWebRequest();

                while (!request.isDone && DateTime.UtcNow < dateTime);

                bool flag;

                if (isConnectionOrProtocolError(request) || DateTime.UtcNow >= dateTime) {
                    flag = false;
                } else {
                    flag = request.responseCode == 200;
                }

                return flag;
            }
        }

        /// <summary>
        /// Sends a PUT request using UnityWebRequest.
        /// </summary>
        /// <param name="url">The URL to PUT to.</param>
        /// <param name="body">The body of the message being sent.</param>
        /// <returns></returns>
        public static IEnumerator PutRequest(string url, string body)
        {
            var request = new UnityWebRequest(url, "PUT");
            byte[] bodyRaw = Encoding.UTF8.GetBytes(body);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);

            yield return request.SendWebRequest();

            if (isConnectionOrProtocolError(request))
            {
                Debug.Log($"PUT request error to {url}: {request.error}");
            }
        }

        /// <summary>
        /// Sends a POST request using UnityWebRequest.
        /// </summary>
        /// <param name="url">The URL to POST to.</param>
        /// <param name="body">The body of the message being sent.</param>
        /// <param name="elmsKey">The keys to check for in the response object data.</param>
        /// <param name="callback">The callback function to send the processed response data to.</param>
        /// <returns></returns>
        public static IEnumerator PostRequest(string url, string body, string[] elmsKey, Action<Dictionary<string, string>> callback) {
            var request = new UnityWebRequest(url, "POST");
            byte[] bodyRaw = Encoding.UTF8.GetBytes(body);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            yield return request.SendWebRequest();

            if (isConnectionOrProtocolError(request))
            {
                Debug.Log("POST request error: " + request.error);
            }
            else if (callback != null)
            {
                var response = JSON.Parse(request.downloadHandler.text)["data"]["tokenDatas"][0];
                Dictionary<string, string> bannerData = ParseGraphResponse(response, elmsKey);
                                
                callback(bannerData);
            }
        }

        /// <summary>
        /// Sends a GET request using UnityWebRequest.
        /// </summary>
        /// <param name="url">The URL to GET from.</param>
        /// <param name="elmsKey">The keys to check for in the response object data.</param>
        /// <param name="callback">The callback function to send the processed response data to.</param>
        /// <returns></returns>
        public static IEnumerator GetRequest(string url, string[] elmsKey, Action<Dictionary<string, string>> callback) {
            if (string.IsNullOrEmpty(url))
            {
                callback(null);
                yield break;
            }

            UnityWebRequest request = UnityWebRequest.Get(url);

            yield return request.SendWebRequest();

            if (isConnectionOrProtocolError(request)) {
                Debug.Log("GET request error: " + request.error);
                Debug.Log("Tried to retrieve: " + url);
            } else {
                var response = JSON.Parse(request.downloadHandler.text);
                Dictionary<string, string> bannerData = new Dictionary<string, string>();

                foreach (string elm in elmsKey) {
                    bannerData.Add(elm, response[elm]);
                }

                callback(bannerData);
            }
        }

        /// <summary>
        /// Retrieves textures from the specified URL.
        /// </summary>
        /// <param name="url">The URL to retrieve the texture from.</param>
        /// <param name="callback">The callback function to send the retrieved texture to.</param>
        /// <returns></returns>
        public static IEnumerator GetTexture(string url, Action<Texture> callback) {
            UnityWebRequest request = UnityWebRequestTexture.GetTexture(url);

            yield return request.SendWebRequest();

            if (isConnectionOrProtocolError(request)) {
                Debug.Log ("Texture GET request error: " + request.error);
            } else {
                Texture t = ((DownloadHandlerTexture)request.downloadHandler).texture;
                callback(t);
            }
        }

        /// <summary>
        /// Parses the JSON response from The Graph into a Dictionary.
        /// </summary>
        /// <param name="response">The JSON response from The Graph.</param>
        /// <param name="elmsKey">The keys to add to the Dictionary.</param>
        /// <returns>A Dictionary with the specified keys.</returns>
        public static Dictionary<string, string> ParseGraphResponse(JSONNode response, string[] elmsKey)
        {
            var sellerAuction = response?["sellerNFTSetting"]?["sellerAuctions"]?[0];
            var latestAuction = new JSONObject();
            for (int i = 0; i < sellerAuction?["buyerCampaignsApproved"].Count; i++)
            {
                if (sellerAuction?["buyerCampaignsApproved"][i] && sellerAuction?["buyerCampaignsApproved"].Count > 0)
                {
                    latestAuction = (JSONObject)sellerAuction["buyerCampaigns"][i];
                }
            }

            Dictionary<string, string> bannerData = new Dictionary<string, string>();

            foreach (string elm in elmsKey)
            {
                bannerData.Add(elm, latestAuction[elm]);
            }
            return bannerData;
        }

        /// <summary>
        /// Checks if the specified request experienced a connection or protocol error.
        /// </summary>
        /// <param name="request">The UnityWebRequest to check.</param>
        /// <returns>True if a connection or protocol error was experienced, else False.</returns>
        private static bool isConnectionOrProtocolError(UnityWebRequest request)
        {
#if UNITY_2020
            return request.result == UnityWebRequest.Result.ConnectionError || request.result == UnityWebRequest.Result.ProtocolError;
#else
            return request.isNetworkError || request.isHttpError;
#endif
        }

    }

}