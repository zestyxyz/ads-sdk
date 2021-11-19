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

        public void CreateNewSession()
        {
            sessionID = Guid.NewGuid().ToString();

            if (Application.platform == RuntimePlatform.OSXEditor || Application.platform == RuntimePlatform.WindowsEditor || Application.platform == RuntimePlatform.LinuxEditor)
            {
                Debug.Log($@"[NEW_SESSION] SESSION_ID: {sessionID}");
            }
        }
    }
}