import * as THREE from 'three';
//import ZestyAd from '@zestymarket/threejs-sdk';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import '../../threejs/dist/zesty-threejs-sdk.js';

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

const scene = new THREE.Scene();
window.scene = scene; // Expose for testing
scene.background = new THREE.Color('blue');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const banner = new ZestyBanner("0", "0x0000000000000000000000000000000000000000", 'polygon', 'tall', 'standard', 3, renderer);
banner.position.set(0, 0, -1);
scene.add(banner);

const banner2 = new ZestyBanner("0", "0x0000000000000000000000000000000000000000", 'polygon', 'wide', 'standard', 3, renderer);
banner2.position.set(0, 0, -2);
scene.add(banner2);

const banner3 = new ZestyBanner("0", "0x0000000000000000000000000000000000000000", 'polygon', 'square', 'standard', 3, renderer);
banner3.position.set(0, 0, -3);
scene.add(banner3);

const banner4 = new ZestyBanner("0", "0x0000000000000000000000000000000000000000", 'polygon', 'tall', 'minimal', 3, renderer);
banner4.position.set(0, 0, -4);
scene.add(banner4);

const banner5 = new ZestyBanner("0", "0x0000000000000000000000000000000000000000", 'polygon', 'wide', 'minimal', 3, renderer);
banner5.position.set(0, 0, -5);
scene.add(banner5);

const banner6 = new ZestyBanner("0", "0x0000000000000000000000000000000000000000", 'polygon', 'square', 'minimal', 3, renderer);
banner6.position.set(0, 0, -6);
scene.add(banner6);

const banner7 = new ZestyBanner("0", "0x0000000000000000000000000000000000000000", 'polygon', 'tall', 'transparent', 3, renderer);
banner7.position.set(0, 0, -7);
scene.add(banner7);

const banner8 = new ZestyBanner("0", "0x0000000000000000000000000000000000000000", 'polygon', 'wide', 'transparent', 3, renderer);
banner8.position.set(0, 0, -8);
scene.add(banner8);

const banner9 = new ZestyBanner("0", "0x0000000000000000000000000000000000000000", 'polygon', 'square', 'transparent', 3, renderer);
banner9.position.set(0, 0, -9);
scene.add(banner9);

document.body.appendChild(VRButton.createButton(renderer));
renderer.xr.enabled = true;

function checkAdClicked(event) {
    event.preventDefault();
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);
    intersects.forEach(obj => {
        if (obj.object.type == "ZestyBanner") {
            banner.onClick();
        }
    })
}
//ad.callback = checkAdClicked;
window.addEventListener('click', checkAdClicked, false);

renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
})