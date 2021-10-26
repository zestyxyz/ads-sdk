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

    public static string ParseProtocol(string uri)
    {
        try
        {
            if (uri.Substring(0, 4) == "ipfs")
            {            
                return $"https://ipfs.zesty.market/ipfs/{uri.Substring(7)}";
            }
            else if (uri.Substring(0, 4) == "http" || uri.Substring(0, 5) == "https")
            {
                return uri;
            }
            else if (uri.Substring(0, 2) == "ar")
            {
                return $"https://arweave.net/{uri.Substring(5)}";
            }
            else // Assume bare IPFS hash
            {
                return $"https://ipfs.zesty.market/ipfs/{uri}";
            }
        }
        catch
        {
            Debug.LogError("The given URI '" + uri + "' is too short and does not conform to any supported protocol.");
            return null;
        }
    }

}