using UnityEditor;
using UnityEngine;

[CustomEditor (typeof (ZestySDK))]
public class GoToSettingsInspector : Editor {
    public override void OnInspectorGUI () {
        DrawDefaultInspector ();

        GUILayout.Space (10);
        if (GUILayout.Button ("Configure Zesty")) {
            ProjectSetup window = (ProjectSetup) EditorWindow.GetWindow (typeof (ProjectSetup));
            window.minSize = ProjectSetup.windowSize;
            window.titleContent = new GUIContent () {
                text = "Zesty SDK"
            };
            window.Show ();
        }
    }
}