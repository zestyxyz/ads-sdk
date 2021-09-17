using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

[InitializeOnLoad]
public class ProjectSetup : EditorWindow, IHasCustomMenu {

    private static Vector2 scrollPos1, scrollPos2;

    public static readonly Vector2 windowSize = new Vector2(350, 450);
    private static bool API_Status;
    private static string applicationID;

    private static bool sandboxMode;

    private static GUIStyle statusStyle;
    private readonly GUIContent RefreshButton = new GUIContent("Refresh");

    private static ProjectSettings settings;

    [MenuItem("Window/Zesty", false, 1)]
    static void Init() {
        ProjectSetup window = (ProjectSetup)GetWindow(typeof(ProjectSetup));
        window.minSize = windowSize;
        window.titleContent = new GUIContent() {
            text = "Zesty"
        };
        window.Show();
    }

    private void Awake() {
        //return;
        //Initialize();
    }

    private static void Initialize() {
        CreateSettingsFile();

        statusStyle = new GUIStyle();
        statusStyle.fontSize = 18;
        statusStyle.normal.textColor = Color.white;

        API_Status = Zesty.API.CheckAPIStatusSync();
        settings = Resources.Load<ProjectSettings>("ProjectSettings");

        if (settings != null) {
            if (string.IsNullOrEmpty(settings.applicationID)) {
                settings.initialSetupDone = false;
            }
            applicationID = settings.applicationID;
            sandboxMode = settings.sandboxMode;
        }

        if (!GameObject.Find("ZestySDK")) {
            GameObject g = (GameObject)Instantiate(Resources.Load("ZestySDK"));
            g.name = "ZestySDK";
        }
    }

    public void AddItemsToMenu(GenericMenu menu) {
        menu.AddItem(RefreshButton, false, Initialize);
    }

    private static void CreateSettingsFile() {
        ProjectSettings temp = Resources.Load<ProjectSettings>("ProjectSettings");
        if (temp == null) {
            temp = CreateInstance<ProjectSettings>();
            if (!Directory.Exists("Assets/Resources")) {
                Directory.CreateDirectory("Assets/Resources");
            }
            AssetDatabase.CreateAsset(temp, "Assets/Resources/ProjectSettings.asset");
        }
    }

    private void OnGUI() {
        var logo = Resources.Load<Texture2D>("Zesty Orange");
        var rect = GUILayoutUtility.GetRect(position.width - 8, 150, GUI.skin.box);
        GUILayout.Label("Zesty Unity SDK v1.4.0");
        if (logo) {
            GUI.DrawTexture(rect, logo, ScaleMode.ScaleToFit);
        }
        if (EditorApplication.isCompiling) {
            GUILayout.Space(15);
            GUILayout.BeginHorizontal();
            GUILayout.FlexibleSpace();
            GUILayout.Label("Please wait, project is compiling...");
            GUILayout.FlexibleSpace();
            GUILayout.EndHorizontal();
            return;
        } else {
            if (settings != null) {
                CheckConfigurationTab();
            }
        }
    }

    void CheckConfigurationTab() {

        // draw menu
        EditorGUILayout.Space();
        EditorGUILayout.Space();
        scrollPos2 = EditorGUILayout.BeginScrollView(scrollPos2);

        EditorGUILayout.LabelField("Application ID", EditorStyles.boldLabel);
        applicationID = EditorGUILayout.TextField(applicationID);

        EditorGUILayout.Space();
        EditorGUILayout.LabelField("General Settings", EditorStyles.boldLabel);
        sandboxMode = EditorGUILayout.Toggle(new GUIContent ("Sandbox Mode", "If Sandbox Mode is enabled, events will print to the console and NOT send to the server. Should be disabled for production builds"), sandboxMode);
        EditorGUILayout.EndScrollView();

        GUILayout.Space(40);
        GUILayout.BeginHorizontal();
        GUILayout.FlexibleSpace();
        GUILayout.Label("Status: ", statusStyle);
        GUILayout.Label(API_Status ? "API working!" : "API not working!", statusStyle);
        GUILayout.FlexibleSpace();
        GUILayout.EndHorizontal();

        // check for changes
        if (HasChanges()) {
            GUILayout.Space(30);
            GUILayout.BeginHorizontal();
            GUILayout.FlexibleSpace();
            GUILayout.Label("You have unsaved changes", statusStyle);
            GUILayout.FlexibleSpace();
            GUILayout.EndHorizontal();
            GUILayout.BeginHorizontal();
            GUILayout.FlexibleSpace();
            GUILayout.EndHorizontal();
            GUILayout.BeginHorizontal();
            GUI.color = Color.yellow;

            // if yes, save and revert button
            if (GUILayout.Button("Save Changes", GUILayout.Height (50))) {
                if (!Application.isPlaying) {
                    settings.sandboxMode = sandboxMode;
                    settings.applicationID = applicationID;
                    EditorUtility.SetDirty(settings);
                    AssetDatabase.SaveAssets();
                    EditorUtility.DisplayDialog("Saved!", "Your changes have been saved!", "Close");
                } else {
                    EditorUtility.DisplayDialog("Alert!", "You cannot change settings while in Play mode", "Close");
                }
            }
            GUI.color = Color.white;
            if (GUILayout.Button("Revert Changes", GUILayout.Height (50))) {
                sandboxMode = settings.sandboxMode;
                applicationID = settings.applicationID;
            }
            GUILayout.EndHorizontal();
        }

    }

    bool HasChanges() {
        if (settings.sandboxMode != sandboxMode || settings.applicationID != applicationID) return true;
        return false;
    }

}