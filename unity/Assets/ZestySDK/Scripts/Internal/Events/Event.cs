using System;
using System.Collections.Generic;
using System.Globalization;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Zesty {

    [Serializable]
    public class Event {

        public string @event;
        public string request_id;
        public long request_created_at_ms;
        public int duration_ms;
        public string session_id;
        public string au_id;
        public string ad_id;

        public Event (string type, int duration, string au_id, string ad_id) {
            this.duration_ms = duration;
            this.request_id = Guid.NewGuid ().ToString ();
            this.request_created_at_ms = (new DateTimeOffset (DateTime.Now).ToUnixTimeMilliseconds ());
            this.@event = type;
            this.session_id = Session.Instance ? Session.Instance.sessionID : string.Empty;
            this.au_id = au_id;
            this.ad_id = ad_id;
        }
    }
}