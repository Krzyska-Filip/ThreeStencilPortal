import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { initEnvironment } from './environment';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true, stencil: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Kamera i obsługa
camera.position.setZ(-15);
const controls = new OrbitControls( camera, renderer.domElement );

// Tło / Interfejs
const backgroundTexture = new THREE.TextureLoader().load('/textures/background.jpg');
scene.background = backgroundTexture;

//const gui = new GUI;
//gui.add(camera, 'fov', 1, 180).onChange();

// Światła
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

// ----------------------------------------------------------------------------------------------------------

// Pozycje portali
const redPortalPosition = new THREE.Vector3(11, 0, 7);
const bluePortalPosition = new THREE.Vector3(-16, 0, -7);
const redPortalRotation = new THREE.Euler(0, 0, 0);
const bluePortalRotation = new THREE.Euler(0, - Math.PI / 2, 0);

// Kamera czerwonego portalu
const redPortalRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const redPortalCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
redPortalCamera.position.copy(redPortalPosition);

// Kamera niebieskiego portalu
const bluePortalRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
const bluePortalCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
bluePortalCamera.position.copy(bluePortalPosition);
bluePortalCamera.rotation.copy(bluePortalRotation);

// Stencil maska
const portalStencil = new THREE.MeshBasicMaterial({ color: 0xffffff });
portalStencil.colorWrite = false;
portalStencil.depthWrite = false;
portalStencil.stencilWrite = true;
portalStencil.stencilRef = 1;
portalStencil.stencilFunc = THREE.AlwaysStencilFunc;
portalStencil.stencilZPass = THREE.ReplaceStencilOp;
portalStencil.side = THREE.DoubleSide;

const redPortalStencil = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), portalStencil.clone());
redPortalStencil.position.copy(redPortalPosition);
redPortalStencil.rotation.copy(redPortalRotation);
redPortalStencil.renderOrder = 1;
scene.add(redPortalStencil);
const redStencilFrame = new THREE.BoxHelper(redPortalStencil, 'red');
scene.add(redStencilFrame);

const bluePortalStencil = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), portalStencil.clone());
bluePortalStencil.position.copy(bluePortalPosition);
bluePortalStencil.rotation.copy(bluePortalRotation);
bluePortalStencil.renderOrder = 1;
scene.add(bluePortalStencil);
const blueStencilFrame = new THREE.BoxHelper(bluePortalStencil, 'blue');
scene.add(blueStencilFrame);

initEnvironment(scene);
// Portal plane z teksturą z render targetu (widoczny tylko w masce stencil)
const redPortalMaterial = new THREE.MeshBasicMaterial({ map: redPortalRenderTarget.texture, side: THREE.DoubleSide });
redPortalMaterial.stencilWrite = true;
redPortalMaterial.stencilRef = 1;
redPortalMaterial.stencilFunc = THREE.EqualStencilFunc;
redPortalMaterial.stencilZPass = THREE.KeepStencilOp;
const redPortalPlane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), redPortalMaterial);
redPortalPlane.position.copy(redPortalPosition);
redPortalPlane.rotation.copy(redPortalRotation);
redPortalPlane.renderOrder = 2;
scene.add(redPortalPlane);

// Drugi portal (niebieski po lewej)
const bluePortalMaterial = new THREE.MeshBasicMaterial({ map: bluePortalRenderTarget.texture, side: THREE.DoubleSide });
bluePortalMaterial.stencilWrite = true;
bluePortalMaterial.stencilRef = 1;
bluePortalMaterial.stencilFunc = THREE.EqualStencilFunc;
bluePortalMaterial.stencilZPass = THREE.KeepStencilOp;
const bluePortalPlane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), bluePortalMaterial);
bluePortalPlane.position.copy(bluePortalPosition);
bluePortalPlane.rotation.copy(bluePortalRotation);
bluePortalPlane.renderOrder = 2;
scene.add(bluePortalPlane);

initEnvironment(scene);

// --- SHADERY UV SCREEN SPACE ---
const portalVertexShader = `
    varying vec4 vScreenPos;

    void main() {
        vScreenPos = gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const portalFragmentShader = `
    uniform sampler2D uMainTex;
    varying vec4 vScreenPos;

    void main() {
        vec2 screenUV = vScreenPos.xy / vScreenPos.w;
        screenUV = screenUV * 0.5 + 0.5;
        gl_FragColor = texture2D(uMainTex, screenUV);
    }
`;

function createPortalScreenSpaceMaterial(renderTarget) {
    return new THREE.ShaderMaterial({
        uniforms: {
            uMainTex: { value: renderTarget.texture }
        },
        vertexShader: portalVertexShader,
        fragmentShader: portalFragmentShader,
        transparent: true,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: THREE.EqualStencilFunc,
        stencilZPass: THREE.KeepStencilOp,
        side: THREE.DoubleSide,
    });
}

const redPortalScreenMat = createPortalScreenSpaceMaterial(redPortalRenderTarget);
const bluePortalScreenMat = createPortalScreenSpaceMaterial(bluePortalRenderTarget);

redPortalPlane.material = bluePortalScreenMat;
bluePortalPlane.material = redPortalScreenMat;

// Camera helpers
const redCameraHelper = new THREE.CameraHelper(redPortalCamera);
const blueCameraHelper = new THREE.CameraHelper(bluePortalCamera);

// scene.add(blueCameraHelper);
// scene.add(redCameraHelper);

function animate() {
    controls.update();
    redPortalPlane.updateMatrixWorld(true);
    bluePortalPlane.updateMatrixWorld(true);

    {
        const playerCameraRelativeMatrix = new THREE.Matrix4();
        playerCameraRelativeMatrix.copy(redPortalPlane.matrixWorld).invert();
        playerCameraRelativeMatrix.multiply(camera.matrixWorld);

        const bluePortalCameraWorldMatrix = new THREE.Matrix4();
        bluePortalCameraWorldMatrix.copy(bluePortalPlane.matrixWorld);
        bluePortalCameraWorldMatrix.multiply(playerCameraRelativeMatrix);

        bluePortalCameraWorldMatrix.decompose(bluePortalCamera.position, bluePortalCamera.quaternion, bluePortalCamera.scale);
        bluePortalCamera.updateMatrixWorld(true);
    }

    {
        const playerCameraRelativeMatrix_RedPortal = new THREE.Matrix4();
        playerCameraRelativeMatrix_RedPortal.copy(bluePortalPlane.matrixWorld).invert();
        playerCameraRelativeMatrix_RedPortal.multiply(camera.matrixWorld);

        const redPortalCameraWorldMatrix = new THREE.Matrix4();
        redPortalCameraWorldMatrix.copy(redPortalPlane.matrixWorld);
        redPortalCameraWorldMatrix.multiply(playerCameraRelativeMatrix_RedPortal);

        redPortalCameraWorldMatrix.decompose(redPortalCamera.position, redPortalCamera.quaternion, redPortalCamera.scale);
        redPortalCamera.updateMatrixWorld(true);
    }

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