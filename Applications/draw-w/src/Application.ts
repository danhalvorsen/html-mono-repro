import * as THREE from 'three'
import type { LineStyle } from './LineStyle'
import type { Point2 } from '@monorepo/core-math'
import type { ApplicationOptions } from './ApplicationOptions'
import type { ThreeCanvasTick } from './ThreeCanvasTick'

export class Application {
  readonly renderer: THREE.WebGLRenderer
  readonly scene: THREE.Scene
  readonly camera: THREE.OrthographicCamera
  readonly root: THREE.Group

  onTick: ThreeCanvasTick | undefined

  #ownsRenderer = false
  #rafId: number | null = null
  #startMs = 0
  #lastMs = 0

  constructor({
    canvas,
    clearColor = 0x0b1020,
    clearAlpha = 1,
    antialias = true,
    pixelRatio = globalThis.devicePixelRatio ?? 1,
    near = 0.1,
    far = 10_000,
    deps,
  }: ApplicationOptions) {
    this.renderer =
      deps?.renderer ??
      this.#createRenderer({
        canvas,
        antialias,
        clearAlpha,
        clearColor,
        pixelRatio,
      })
    this.#ownsRenderer = deps?.renderer === undefined

    this.scene = deps?.scene ?? new THREE.Scene()
    this.camera = deps?.camera ?? this.#createCamera({ near, far })

    this.root = deps?.root ?? new THREE.Group()
    if (this.root.parent === null) this.scene.add(this.root)
  }

  resize(width: number, height: number): void {
    const safeWidth = Math.max(1, Math.floor(width))
    const safeHeight = Math.max(1, Math.floor(height))
    this.renderer.setSize(safeWidth, safeHeight, false)
    this.camera.left = -safeWidth / 2
    this.camera.right = safeWidth / 2
    this.camera.top = safeHeight / 2
    this.camera.bottom = -safeHeight / 2
    this.camera.updateProjectionMatrix()
  }

  render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  start(): void {
    if (this.#rafId !== null) return
    const now = performance.now()
    this.#startMs = now
    this.#lastMs = now
    this.#rafId = requestAnimationFrame(this.#tick)
  }

  stop(): void {
    if (this.#rafId === null) return
    cancelAnimationFrame(this.#rafId)
    this.#rafId = null
  }

  clear(): void {
    for (const child of [...this.root.children]) {
      child.removeFromParent()
      this.#disposeObject(child)
    }
  }

  drawLine(a: Point2, b: Point2, style: LineStyle = {}): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(a.x, a.y, 0),
      new THREE.Vector3(b.x, b.y, 0),
    ])
    const material = new THREE.LineBasicMaterial({
      color: style.color ?? 0xffffff,
      transparent: style.opacity !== undefined && style.opacity < 1,
      opacity: style.opacity ?? 1,
    })
    const line = new THREE.Line(geometry, material)
    this.root.add(line)
    return line
  }

  dispose(): void {
    this.stop()
    this.clear()
    if (this.#ownsRenderer) this.renderer.dispose()
  }

  #createRenderer({
    canvas,
    antialias,
    clearAlpha,
    clearColor,
    pixelRatio,
  }: {
    canvas: HTMLCanvasElement
    antialias: boolean
    clearAlpha: number
    clearColor: THREE.ColorRepresentation
    pixelRatio: number
  }): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias,
      alpha: clearAlpha < 1,
    })
    renderer.setPixelRatio(pixelRatio)
    renderer.setClearColor(clearColor, clearAlpha)
    return renderer
  }

  #createCamera({ near, far }: { near: number; far: number }): THREE.OrthographicCamera {
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, near, far)
    camera.position.set(0, 0, 1000)
    camera.lookAt(0, 0, 0)
    return camera
  }

  #tick = (nowMs: number) => {
    this.#rafId = requestAnimationFrame(this.#tick)

    const deltaMs = nowMs - this.#lastMs
    this.#lastMs = nowMs

    const elapsedMs = nowMs - this.#startMs
    this.onTick?.({
      deltaMs,
      elapsedMs,
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
    })
    this.render()
  }

  #disposeObject(object: THREE.Object3D): void {
    object.traverse((obj) => {
      const anyObj = obj as unknown as { geometry?: unknown; material?: unknown }
      if (anyObj.geometry && anyObj.geometry instanceof THREE.BufferGeometry) {
        anyObj.geometry.dispose()
      }

      if (!anyObj.material) return

      const material = anyObj.material as THREE.Material | THREE.Material[]
      if (Array.isArray(material)) material.forEach((m) => m.dispose())
      else material.dispose()
    })
  }
}
