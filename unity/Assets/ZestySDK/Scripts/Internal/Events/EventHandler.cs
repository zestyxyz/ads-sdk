using System;
using System.Collections.Generic;
using System.Globalization;
using UnityEngine;

namespace Zesty {

    [DisallowMultipleComponent]
    public class EventHandler : MonoBehaviour {

        public static EventHandler Instance { get; private set; }

        void Awake () {
            if (Instance != null && Instance != this) {
                Destroy (gameObject);
            } else {
                Instance = this;
            }
        }

        public void SendEvent (string url, Event e) {
            string _event = JsonUtility.ToJson (e);

            //StartCoroutine (API.PostRequest (url, _event));
        }
    }

}