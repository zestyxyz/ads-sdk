using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SimpleJSON;
using UnityEngine;

public class Utils : MonoBehaviour {
    
    public static string GetCurrentTimeString () {
        return DateTime.UtcNow.ToString ("yyyy-MM-ddTHH\\:mm\\:ss.ffffZ");
    }

    /// <summary>
    /// Required for interaction with Zesty smart contracts.
    /// </summary>
    /// <returns>The current Unix time in seconds.</returns>
    public static int GetCurrentUnixTime()
    {
        DateTime epochStart = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        return (int)(DateTime.UtcNow - epochStart).TotalSeconds;
    }

}