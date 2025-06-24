import * as THREE from 'three';

export function createPortalPlane({
    renderTarget,
    position,
    rotation,
}) {
    const material = new THREE.MeshBasicMaterial({ map: renderTarget.texture, side: THREE.DoubleSide });
    material.stencilWrite = true;
    material.stencilRef = 1;
    material.stencilFunc = THREE.EqualStencilFunc;
    material.stencilZPass = THREE.KeepStencilOp;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), material);
    mesh.position.copy(position);
    mesh.rotation.copy(rotation);
    mesh.renderOrder = 2;
    return mesh;
}

export function updatePortalCamera({
    srcPortalPlane,
    dstPortalPlane,
    playerCamera,
    portalCamera
}) {
    const playerCameraRelativeMatrix = new THREE.Matrix4();
    playerCameraRelativeMatrix.copy(srcPortalPlane.matrixWorld).invert();
    playerCameraRelativeMatrix.multiply(playerCamera.matrixWorld);

    const portalCameraWorldMatrix = new THREE.Matrix4();
    portalCameraWorldMatrix.copy(dstPortalPlane.matrixWorld);
    portalCameraWorldMatrix.multiply(playerCameraRelativeMatrix);

    portalCameraWorldMatrix.decompose(portalCamera.position, portalCamera.quaternion, portalCamera.scale);
    portalCamera.updateMatrixWorld(true);
}

export function createPortalStencil(position, rotation, color = 0xffffff) {
    const portalStencil = new THREE.MeshBasicMaterial({ color });
    portalStencil.colorWrite = false;
    portalStencil.depthWrite = false;
    portalStencil.stencilWrite = true;
    portalStencil.stencilRef = 1;
    portalStencil.stencilFunc = THREE.AlwaysStencilFunc;
    portalStencil.stencilZPass = THREE.ReplaceStencilOp;
    portalStencil.side = THREE.DoubleSide;

    const stencilMesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), portalStencil.clone());
    stencilMesh.position.copy(position);
    stencilMesh.rotation.copy(rotation);
    stencilMesh.renderOrder = 1;
    return stencilMesh;
}

export function createPortalScreenSpaceMaterial(renderTarget) {
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
            vec4 texColor = texture2D(uMainTex, screenUV);
            texColor.rgb = pow(texColor.rgb, vec3(1.0/2.2));
            gl_FragColor = texColor;
        }
    `;
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