using System;
using System.Collections;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Zesty {
    [DisallowMultipleComponent]
    public class Session : MonoBehaviour {

        public static Session Instance { get; private set; }

        [HideInInspector]
        public string sessionID;

        void Awake () {
            if (Instance != null && Instance != this) {
                Destroy (gameObject);
            } else {
                Instance = this;
            }
        }

        void Start () {
            CreateNewSession ();
        }

        public void CreateNewSession () {
            sessionID = Guid.NewGuid ().ToString ();

            if (Application.platform == RuntimePlatform.OSXEditor || Application.platform == RuntimePlatform.WindowsEditor || Application.platform == RuntimePlatform.LinuxEditor) {
                Debug.Log ($@"[NEW_SESSION] SESSION_ID: {sessionID}");

            }
        }

    }
}