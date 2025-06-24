import * as THREE from 'three';

export class Movement {
    move = { forward: false, backward: false, left: false, right: false, up: false, down: false };
    moveSpeed = 0.4;
    isPointerLocked = false;
    mouseSensitivity = 0.002;
    cameraRotation = { yaw: 0, pitch: 0 };
    camera: THREE.PerspectiveCamera;
    domElement: HTMLElement;

    constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.initEvents();
    }

    initEvents() {
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        });

        window.addEventListener('load', () => {
            setTimeout(() => {
                this.domElement.requestPointerLock();
            }, 100);
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.domElement;
        });

        document.addEventListener('mousemove', (event) => {
            if (!this.isPointerLocked) return;
            this.cameraRotation.yaw -= event.movementX * this.mouseSensitivity;
            this.cameraRotation.pitch -= event.movementY * this.mouseSensitivity;
            this.cameraRotation.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraRotation.pitch));
            this.camera.rotation.order = 'YXZ';
            this.camera.rotation.y = this.cameraRotation.yaw;
            this.camera.rotation.x = this.cameraRotation.pitch;
        });

        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyW') this.move.forward = true;
            if (e.code === 'KeyS') this.move.backward = true;
            if (e.code === 'KeyA') this.move.left = true;
            if (e.code === 'KeyD') this.move.right = true;
            if (e.code === 'Space') this.move.up = true;
            if (e.code === 'ShiftLeft') this.move.down = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW') this.move.forward = false;
            if (e.code === 'KeyS') this.move.backward = false;
            if (e.code === 'KeyA') this.move.left = false;
            if (e.code === 'KeyD') this.move.right = false;
            if (e.code === 'Space') this.move.up = false;
            if (e.code === 'ShiftLeft') this.move.down = false;
        });
    }

    update() {
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        dir.y = 0; dir.normalize();
        const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
        if (this.move.forward) this.camera.position.addScaledVector(dir, this.moveSpeed);
        if (this.move.backward) this.camera.position.addScaledVector(dir, -this.moveSpeed);
        if (this.move.left) this.camera.position.addScaledVector(right, -this.moveSpeed);
        if (this.move.right) this.camera.position.addScaledVector(right, this.moveSpeed);
        if (this.move.up) this.camera.position.y += this.moveSpeed;
        if (this.move.down) this.camera.position.y -= this.moveSpeed;
    }
}
