using UnityEngine;

[DisallowMultipleComponent]
public class ZestySDK : MonoBehaviour {
    public static ZestySDK Instance { get; private set; }

    public static bool ZestyEnabled {
        get { return Instance.gameObject.activeSelf; }
        set { Instance.gameObject.SetActive (value); }
    }

    void Awake () {
        if (Instance) {
            DestroyImmediate (gameObject);
        } else {
            DontDestroyOnLoad (gameObject);
            Instance = this;
        }
    }

    void OnEnable () {
        ZestyEnabled = true;
    }

    void OnDisable () {
        ZestyEnabled = false;
    }
}