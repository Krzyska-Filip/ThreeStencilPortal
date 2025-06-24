import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function initEnvironment(scene: THREE.Scene) {

    const floorSize = new THREE.Vector3(30, 1, 100);
    const floor1Pos = new THREE.Vector3(20, -5, 0);
    const floor2Pos = new THREE.Vector3(-20, -5, 0);
    const floor1Color = '#5DBB63';
    const floor2Color = '#FFB343';

    const rockPositions = [
        [25, floor1Pos.y, 10, 0],
        [15, floor1Pos.y, -20, Math.PI / 4],
        [22, floor1Pos.y, 30, Math.PI / 2],
        [18, floor1Pos.y, -40, Math.PI],
        [20, floor1Pos.y, 0, -Math.PI / 2]
    ];

    const barrelPositions = [
        [-25, floor2Pos.y, 10, 0],
        [-15, floor2Pos.y, -20, 0],
        [-22, floor2Pos.y, 30, 0],
        [-18, floor2Pos.y, -40, 0],
        [-20, floor2Pos.y, 0, 0]
    ];

    const lanternPosition = [
        [-30, floor2Pos.y, -40, 0],
        [-30, floor2Pos.y, 40, 0],
        [-30, floor2Pos.y, 0, 0],
        [-10, floor2Pos.y, -40, Math.PI],
        [-10, floor2Pos.y, 40, Math.PI],
        [-10, floor2Pos.y, 0, Math.PI],
    ];

    const bushPositions = [
        [15, floor1Pos.y, 50, 0],
        [15, floor1Pos.y, -20, Math.PI / 4],
        [30, floor1Pos.y, 30, Math.PI / 2],
        [23, floor1Pos.y, -40, Math.PI],
        [30, floor1Pos.y, 0, -Math.PI / 2]
    ];

    const fencePositions = [
        [35, floor1Pos.y, -45, -Math.PI / 8],
        [35, floor1Pos.y, -30, -Math.PI / 8],
        [35, floor1Pos.y, -15, -Math.PI / 8],
        [35, floor1Pos.y, 0, -Math.PI / 8],
        [35, floor1Pos.y, 15, -Math.PI / 8],
        [35, floor1Pos.y, 30, -Math.PI / 8],
        [35, floor1Pos.y, 45, -Math.PI / 8],
    ];

    const loader = new GLTFLoader();

    const floor1 = createPlatform(floor1Pos, floorSize, floor1Color);
    const floor2 = createPlatform(floor2Pos, floorSize, floor2Color);
    scene.add(floor1);
    scene.add(floor2);

    loadAndPlaceModels(loader, scene, 'models/rock.glb', rockPositions, 2);
    loadAndPlaceModels(loader, scene, 'models/low_poly_barrel.glb', barrelPositions, 1.5);
    loadAndPlaceModels(loader, scene, 'models/stylized_lantern.glb', lanternPosition, 4);
    loadAndPlaceModels(loader, scene, 'models/cartoonish_bush.glb', bushPositions, 2);
    loadAndPlaceModels(loader, scene, 'models/fence_wood.glb', fencePositions, 3);
}

function createPlatform(position, size, color) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshPhongMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    return mesh;
}

function loadAndPlaceModels(loader, scene, modelPath, positions, scale = 1) {
    loader.load(modelPath, (gltf) => {
        positions.forEach(pos => {
            const obj = gltf.scene.clone();
            obj.position.set(pos[0], pos[1], pos[2]);
            obj.rotation.y = pos[3] || 0;
            if (scale !== 1) obj.scale.setScalar(scale);
            scene.add(obj);
        });
    });
}

export function createSign(color: number, position: THREE.Vector3, scale?: THREE.Vector3,  rotation?: THREE.Euler) {
    const signGroup = new THREE.Group();
    
    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 }); 
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 1.5;
    signGroup.add(pole);
    
    const signGeometry = new THREE.BoxGeometry(2, 1, 0.1);
    const signMaterial = new THREE.MeshPhongMaterial({ color: color });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.y = 2.5;
    signGroup.add(sign);
    
    const textGeometry = new THREE.BoxGeometry(1.5, 0.3, 0.05);
    const textMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 2.5, 0.08);
    signGroup.add(textMesh);
    
    signGroup.position.copy(position);
    if (rotation) {
        signGroup.rotation.copy(rotation);
    }
    
    if (scale) {
        signGroup.scale.copy(scale);
    }
    return signGroup;
}

