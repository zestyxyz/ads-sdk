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

    /// <summary>
    /// Takes in a URI and parses it for a protocol to return a properly formatted URI.
    /// </summary>
    /// <param name="uri">The URI to parse</param>
    /// <returns>The properly formatted URI, or null if it is invalid.</returns>
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

    /// <summary>
    /// Retrieves a random IPFS gateway to alleviate rate-throttling from using only a single gateway.
    /// </summary>
    /// <returns>A random public IPFS gateway</returns>
    public static string getIPFSGateway() {
        Tuple<string, int>[] gateways = {
            new Tuple<string, int>("https://cloudflare-ipfs.com", 35),
            new Tuple<string, int>("https://ipfs.fleek.co", 35),
            new Tuple<string, int>("https://gateway.pinata.cloud", 20),
            new Tuple<string, int>("https://dweb.link", 10)
        };

        int[] weights = new int[4];
        int i = 0;
        for (i = 0; i < gateways.Length; i++) {
            if (i == 0) {
                weights[i] = gateways[i].Item2;
            }
            else {
                weights[i] = gateways[i].Item2 + (weights[i - 1]);
            }
        }
        float random = UnityEngine.Random.value * weights[weights.Length - 1];
        for (i = 0; i < weights.Length; i++) {
            if (weights[i] > random) break;
        }
        return gateways[i].Item1;
    }

}