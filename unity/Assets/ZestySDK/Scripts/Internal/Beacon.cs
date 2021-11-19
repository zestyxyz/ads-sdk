using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Zesty;

public class Beacon : MonoBehaviour
{
    public bool beaconEnabled = false;
    private Banner banner = null;
    
    void Start()
    {
        banner = GetComponent<Banner>();

        if (beaconEnabled)
        {
            // Fire onLoad signal to beacon
            StartCoroutine(API.PutRequest(Constants.BEACON_URL + $"/space/{banner.space}", "onLoad"));
        }
    }
}
