import { sendMetric } from './networking';
import { log } from './logger';
import { invert } from './math-utils/matrix'

function getCameraHelper(callback) {
  const camera = document.querySelector('[camera]');
  if (camera && camera.components && camera.components.camera && camera.components.camera.camera) {
    callback(camera.components.camera.camera);
  } else {
    setTimeout(function() {
      getCameraHelper(callback);
    }, 2000);
  }
}

// Camera might not be initialized at scene initialization, so we poll
// until we can register the camera.
async function getCamera() {
  return new Promise((resolve) => {
    getCameraHelper((camera) => {
      resolve(camera);
    });
  });
}

const cameraFuture = getCamera();
const frustum = new THREE.Frustum();
const cameraViewProjectionMatrix = new THREE.Matrix4();
const box = new THREE.Box3();
const parentPosition = new THREE.Vector3();
const objectPosition = new THREE.Vector3();

function isObjectInCameraFrustum(object, camera, sceneEl) {
  if (!camera || !sceneEl.camera) {
    return false;
  }

  if(sceneEl.renderer.xr.isPresenting) {
    let currentCameraPose = document.querySelector('a-scene').renderer.xr.getCameraPose();
    let inverse = currentCameraPose.transform.matrix;

    // Adding parent position to Camera in WebXR space
    sceneEl.camera.parent.getWorldPosition(parentPosition);
    inverse[12] += parentPosition.x;
    inverse[13] += parentPosition.y;
    inverse[14] += parentPosition.z;

    // TODO: Add rotational offset from the parent

    // Object with elements is needed for multiplyMatrices
    inverse = { elements: invert(inverse, inverse) };
    let projectionMatrix = { elements: currentCameraPose.views[0].projectionMatrix };

    cameraViewProjectionMatrix.multiplyMatrices(projectionMatrix, inverse);
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

    box.setFromObject(object);
    if(!object.center)
      object.center = new THREE.Vector3();
    box.getCenter(object.center);

    return frustum.containsPoint(object.center);
  } else {
    let currentCamera = camera;
    cameraViewProjectionMatrix.multiplyMatrices(currentCamera.projectionMatrix, currentCamera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
    box.setFromObject(object);
    if(!object.center)
      object.center = new THREE.Vector3();
    box.getCenter(object.center);
    return frustum.containsPoint(object.center);
  }
}

function rayIntersectsObject(object, camera, scene) {
  const cameraPosition = new THREE.Vector3();
  camera.updateMatrixWorld();
  camera.getWorldPosition(cameraPosition);
  const raycaster = new THREE.Raycaster(
    cameraPosition, // origin
    object.center.sub(cameraPosition).normalize(), // direction
    camera.near, // near
    camera.far, // far
  );

  // Optimizations:
  //   - Only compare against objects in camera frustum.
  //     - Will be more impactful once we cache visibility on three.js side.
  const intersections = raycaster.intersectObject(scene, true);
  if (intersections.length === 0) {
    return false;
  }
  const intersection = intersections[0];
  return object.getObjectById(intersection.object.id) !== undefined;
}

function getDistanceToCamera(object, camera, sceneEl) {
  if (!camera || !sceneEl.camera) {
    return false;
  }

  if(sceneEl.renderer.xr.isPresenting) {
    let currentCameraPose = document.querySelector('a-scene').renderer.xr.getCameraPose();
    let position = currentCameraPose.transform.position;

    // Adding parent position to Camera in WebXR space
    sceneEl.camera.parent.getWorldPosition(parentPosition);
    parentPosition.x += position.x;
    parentPosition.y += position.y;
    parentPosition.z += position.z;

    object.getWorldPosition(objectPosition);

    return objectPosition.distanceTo(parentPosition);
  } else {
    camera.getWorldPosition(parentPosition);
    object.getWorldPosition(objectPosition);

    return objectPosition.distanceTo(parentPosition);
  }
}

const maxDistance = 15.0;

AFRAME.registerComponent('visibility-check', {
  init: function() {
    this.object = this.el.object3D;
    cameraFuture.then((camera) => {
      this.camera = camera;
    });

    this.sceneEl = document.querySelector('a-scene')
    this.sceneEl.addEventListener('enter-vr', (e) => {
      console.log(e);
    })
    this.scene = this.sceneEl.object3D;

    this.lastVisible = null;
    this.durationThreshold = 10000;

    this.throttledFunction = AFRAME.utils.throttle(this.check, 500, this);
  },

  tick: function() {
    this.throttledFunction();
  },

  check: function() {
    let distanceToCamera = getDistanceToCamera(this.object, this.camera, this.sceneEl);
    const isVisible =
      isObjectInCameraFrustum(this.object, this.camera, this.sceneEl) &&
      distanceToCamera < maxDistance;
    if (!this.lastVisible && isVisible) {
      this.lastVisible = new Date().getTime();
    } else if (this.lastVisible) {
      const duration = new Date().getTime() - this.lastVisible;
      if (!isVisible || duration > this.durationThreshold) {
        // Only logging when a view session is interrupted through isVisible=false
        // is not enough because we could miss out on events e.g. if a game is turned off
        // without triggering isVisible=false.
        const duration = new Date().getTime() - this.lastVisible;

        // sendMetric(
        //   'view', // event
        //   duration, // duration
        //   this.el.adId, // adId
        //   this.el.auId, // auId
        // );

        log(`${this.object.id} - Gaze for ${duration}ms`);
        this.lastVisible = null;
      }
    }
  },
});
