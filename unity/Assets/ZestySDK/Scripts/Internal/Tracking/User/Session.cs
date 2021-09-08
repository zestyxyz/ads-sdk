using System;
using System.Net;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Security.Cryptography;
using System.Text;

namespace Zesty {
    [DisallowMultipleComponent]
    public class Session : MonoBehaviour {

        public static Session Instance { get; private set; }

        [HideInInspector]
        public string sessionID;

        private byte[] signedMessage;

        void Awake () {
            if (Instance != null && Instance != this) {
                Destroy (gameObject);
            } else {
                Instance = this;
            }
        }

        void Start() {
            CreateNewSession();
        }

        public void CreateNewSession() {
            sessionID = Guid.NewGuid ().ToString ();

            if (Application.platform == RuntimePlatform.OSXEditor || Application.platform == RuntimePlatform.WindowsEditor || Application.platform == RuntimePlatform.LinuxEditor) {
                Debug.Log ($@"[NEW_SESSION] SESSION_ID: {sessionID}");

            }

            string[] key = { "ip" };
            StartCoroutine(API.GetRequest("https://api.myip.com", key, sendIP));
        }

        private void sendIP(Dictionary<string, string> info)
        {
            byte[] ip = Encoding.ASCII.GetBytes(info["ip"]);
            using (SHA256CryptoServiceProvider sha = new SHA256CryptoServiceProvider())
            {
                byte[] hashedIP = sha.ComputeHash(ip);
                string hashedIPString = Encoding.ASCII.GetString(hashedIP);
                Debug.Log(hashedIPString);
                StartCoroutine(API.PostRequest(Constants.DEV_API_METRICS_URL, hashedIPString, null, null));
            }
        }

    }
}