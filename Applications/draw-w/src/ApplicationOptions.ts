import * as THREE from 'three'

export type ApplicationDependencies = Readonly<{
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.OrthographicCamera
  root: THREE.Group
}>

export type ApplicationOptions = {
  canvas: HTMLCanvasElement
  clearColor?: THREE.ColorRepresentation
  clearAlpha?: number
  antialias?: boolean
  pixelRatio?: number
  near?: number
  far?: number
  deps?: Partial<ApplicationDependencies>
}
