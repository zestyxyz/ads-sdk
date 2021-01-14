import { sendMetric } from './networking';
import { log } from './logger';

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

function isObjectInCameraFrustum(object, camera) {
  if (!camera) {
    return false;
  }
  const frustum = new THREE.Frustum();
  const cameraViewProjectionMatrix = new THREE.Matrix4();

  camera.updateMatrixWorld();
  camera.matrixWorldInverse.getInverse(camera.matrixWorld);
  cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromMatrix(cameraViewProjectionMatrix);

  const box = new THREE.Box3().setFromObject(object);
  object.center = new THREE.Vector3();
  box.getCenter(object.center);

  return frustum.containsPoint(object.center);
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

AFRAME.registerComponent('visibility-check', {
  init: function() {
    this.object = this.el.object3D;
    cameraFuture.then((camera) => {
      this.camera = camera;
    });
    this.scene = document.querySelector('a-scene').object3D;
    this.lastVisible = null;
    this.durationThreshold = 10000;

    this.throttledFunction = AFRAME.utils.throttle(this.check, 500, this);
  },

  tick: function() {
    this.throttledFunction();
  },

  check: function() {
    const isVisible =
      isObjectInCameraFrustum(this.object, this.camera) &&
      rayIntersectsObject(this.object, this.camera, this.scene);
    if (!this.lastVisible && isVisible) {
      this.lastVisible = new Date().getTime();
    } else if (this.lastVisible) {
      const duration = new Date().getTime() - this.lastVisible;
      if (!isVisible || duration > this.durationThreshold) {
        // Only logging when a gaze session is interrupted through isVisible=false
        // is not enough because we could miss out on events e.g. if a game is turned off
        // without triggering isVisible=false.
        const duration = new Date().getTime() - this.lastVisible;
        sendMetric(
          'gaze', // event
          duration, // duration
          this.el.adId, // adId
          this.el.auId, // auId
        );
        log(`${this.object.id} - Gaze for ${duration}ms`);
        this.lastVisible = null;
      }
    }
  },
});
