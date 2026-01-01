import * as THREE from 'three';


export type ThreeCanvasTick = (args: {
  deltaMs: number;
  elapsedMs: number;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
}) => void;
