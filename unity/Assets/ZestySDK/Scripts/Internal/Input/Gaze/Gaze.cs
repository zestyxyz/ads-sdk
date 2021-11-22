using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Zesty {

    public class Gaze : MonoBehaviour {
        public Camera viewCamera;

        int distance = 15;

        GameObject lastGazedUpon;

        void Start () {
            //InvokeRepeating ("CheckGaze", Constants.TIME_GAZE_DETECTION_ON_START, Constants.GAZE_DETECTION_RATE);
        }

        private void CheckGaze () {
            if (!viewCamera) {
                // If there is no camera attached, try to use the main camera.
                if (Camera.main) viewCamera = Camera.main;
                else return;
            }

            if (lastGazedUpon) lastGazedUpon.SendMessage ("NotGazingUpon", SendMessageOptions.DontRequireReceiver);

            Ray gazeRay = new Ray (viewCamera.transform.position, viewCamera.transform.rotation * Vector3.forward);
            RaycastHit hit;
            // TODO: Add distance here
            if (Physics.Raycast (gazeRay, out hit, /*distance*/ Mathf.Infinity)) {
                hit.transform.SendMessage ("GazingUpon", SendMessageOptions.DontRequireReceiver);
                lastGazedUpon = hit.transform.gameObject;
            }
        }
    }

}