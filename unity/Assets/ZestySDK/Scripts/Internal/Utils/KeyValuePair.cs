using System;

[Serializable]
public class KeyValuePair {
    public string key;
    public string value;

    public KeyValuePair (string key, string value) {
        this.key = key;
        this.value = value;
    }
}