import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import * as ENVIROMENT from './environment';
import * as PORTAL from './portal';
import { Movement } from './movement';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true, stencil: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Kamera i obsługa
camera.position.set(0, 5, 45);
const movement = new Movement(camera, renderer.domElement);

// Światło / Tło / Interfejs
const backgroundTexture = new THREE.TextureLoader().load('/textures/background.jpg');
scene.background = backgroundTexture;

const gui = new GUI();
const helpersFolder = gui.addFolder('Camera Helpers');
const helpersState = {
    redCameraHelper: false,
    blueCameraHelper: false
};

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const redPortalPosition = new THREE.Vector3(17, 0, 7);
const bluePortalPosition = new THREE.Vector3(-17, 0, -7);
const redPortalRotation = new THREE.Euler(0, 0, 0);
const bluePortalRotation = new THREE.Euler(0, - Math.PI / 5, 0);

// Kamery i render targety portali
const redPortalRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const redPortalCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
redPortalCamera.position.copy(redPortalPosition);

const bluePortalRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const bluePortalCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
bluePortalCamera.position.copy(bluePortalPosition);
bluePortalCamera.rotation.copy(bluePortalRotation);

const redPortalStencil = PORTAL.createPortalStencil(redPortalPosition, redPortalRotation, 0xe74c3c);
const bluePortalStencil = PORTAL.createPortalStencil(bluePortalPosition, bluePortalRotation, 0x3498db);

scene.add(redPortalStencil);
const redStencilFrame = new THREE.BoxHelper(redPortalStencil, 'red');
scene.add(redStencilFrame);

scene.add(bluePortalStencil);
const blueStencilFrame = new THREE.BoxHelper(bluePortalStencil, 'blue');
scene.add(blueStencilFrame);

// Tworzenie płaszczyzn portali
ENVIROMENT.initEnvironment(scene);
const redPortalPlane = PORTAL.createPortalPlane({
    renderTarget: bluePortalRenderTarget,
    position: redPortalPosition,
    rotation: redPortalRotation,
});
scene.add(redPortalPlane);

const bluePortalPlane = PORTAL.createPortalPlane({
    renderTarget: redPortalRenderTarget,
    position: bluePortalPosition,
    rotation: bluePortalRotation,
});
scene.add(bluePortalPlane);

// Ustawianie shaderów dla portali
const redPortalScreenMat = PORTAL.createPortalScreenSpaceMaterial(redPortalRenderTarget);
const bluePortalScreenMat = PORTAL.createPortalScreenSpaceMaterial(bluePortalRenderTarget);

redPortalPlane.material = bluePortalScreenMat;
bluePortalPlane.material = redPortalScreenMat;

// Pomocnicze kamery
const redCameraHelper = new THREE.CameraHelper(redPortalCamera);
const blueCameraHelper = new THREE.CameraHelper(bluePortalCamera);

helpersFolder.add(helpersState, 'redCameraHelper').name('Red Camera Helper').onChange((v) => {
    if (v) scene.add(redCameraHelper); else scene.remove(redCameraHelper);
});
helpersFolder.add(helpersState, 'blueCameraHelper').name('Blue Camera Helper').onChange((v) => {
    if (v) scene.add(blueCameraHelper); else scene.remove(blueCameraHelper);
});
helpersFolder.open();


// Tworzenie znaków przed i za portalami
function createSignInFrontOfPortal(color, portalPosition, portalRotation, offset = 5) {
    const pos = portalPosition.clone();
    pos.y -= 5;
    const dir = new THREE.Vector3(0, 0, 1).applyEuler(portalRotation);
    pos.add(dir.multiplyScalar(offset));
    return ENVIROMENT.createSign(color, pos, undefined, portalRotation.clone());
}

const sign1 = createSignInFrontOfPortal(0x3498db, redPortalPosition, redPortalRotation, -5); // przód czerwonego portalu
scene.add(sign1);
const sign2 = createSignInFrontOfPortal(0xe74c3c, redPortalPosition, redPortalRotation, 5); // tył czerwonego portalu
scene.add(sign2);
const sign3 = createSignInFrontOfPortal(0xf1c40f, bluePortalPosition, bluePortalRotation, -5); // przód niebieskiego portalu
scene.add(sign3);
const sign4 = createSignInFrontOfPortal(0x2ecc71, bluePortalPosition, bluePortalRotation, 5); // tył niebieskiego portalu
scene.add(sign4);

function animate() {
    redPortalPlane.updateMatrixWorld(true);
    bluePortalPlane.updateMatrixWorld(true);
    movement.update();
    
    PORTAL.updatePortalCamera({
        srcPortalPlane: redPortalPlane,
        dstPortalPlane: bluePortalPlane,
        playerCamera: camera,
        portalCamera: bluePortalCamera,
    });

    PORTAL.updatePortalCamera({
        srcPortalPlane: bluePortalPlane,
        dstPortalPlane: redPortalPlane,
        playerCamera: camera,
        portalCamera: redPortalCamera,
    });

    redCameraHelper.update();
    blueCameraHelper.update();

    redPortalPlane.visible = false;
    bluePortalPlane.visible = false;

    renderer.setRenderTarget(redPortalRenderTarget);
    renderer.render(scene, redPortalCamera);

    renderer.setRenderTarget(bluePortalRenderTarget);
    renderer.render(scene, bluePortalCamera);

    redPortalPlane.visible = true;
    bluePortalPlane.visible = true;

    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);