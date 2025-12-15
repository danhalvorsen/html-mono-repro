import * as THREE from "three";
import { VectorField } from "./VectorField.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const field = new VectorField()
    .noise(0.4, 0.2)
    .withCurl(0.4)
    .withGradient(new THREE.Vector3(0, 0, 0), 0.2)
    .done();

const segment = field
    .LineSegment(1.5, 40, 0x44ccff)
    .start(new THREE.Vector3(-4, 0, 0))
    .steps(200)
    .stepSize(0.05)
    .FadeTail(0.25)
    // .Use(new SplineGeometryStrategy(60))
    .build(scene);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    segment.update();
    renderer.render(scene, camera);
}
animate();
