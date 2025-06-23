import * as THREE from 'three';

export function initEnvironment(scene: THREE.Scene, count: number = 15) {
    // Dodaj losowe boxy, sfery i walce o różnych kolorach
    const geometries = [
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.SphereGeometry(0.7, 24, 24),
        new THREE.CylinderGeometry(0.5, 0.5, 1.5, 24)
    ];
    for (let i = 0; i < count; i++) { // zwiększono liczbę meshów
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const color = new THREE.Color(Math.random(), Math.random(), Math.random());
        const material = new THREE.MeshPhongMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
        (Math.random() - 0.5) * 40, // większy obszar
        Math.random() * 8 - 4,
        (Math.random() - 0.5) * 40
        );
        mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
        );
        scene.add(mesh);
    }

    const floorGeometry = new THREE.PlaneGeometry(20, 100);
    const floorMaterial1 = new THREE.MeshPhongMaterial({ color: new THREE.Color(0.2, 0.5, 0.2) }); // rgb(55, 94, 55)
    const floorMaterial2 = new THREE.MeshPhongMaterial({ color: new THREE.Color(0.5, 0.2, 0.2) }); // rgb(94, 55, 55)
    const floor1 = new THREE.Mesh(floorGeometry, floorMaterial1);
    const floor2 = new THREE.Mesh(floorGeometry, floorMaterial2);
    floor1.position.set(20, -5, 0);
    floor2.position.set(-20, -5, 0);
    floor1.rotation.x = -Math.PI / 2; // obrót o 90 stopni
    floor2.rotation.x = -Math.PI / 2; // obrót o 90 stopni
    scene.add(floor1);
    scene.add(floor2);
}