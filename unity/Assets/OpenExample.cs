using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Zesty;

public class OpenExample : MonoBehaviour
{
    private Banner banner;

    private void Start()
    {
        banner = GetComponent<Banner>();
    }

    private void OnTriggerEnter(Collider other)
    {
        Debug.Log("Colliding with " + other.name);
        banner.onClick();
    }
}
