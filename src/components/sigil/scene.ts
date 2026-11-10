// src/components/sigil/scene.ts
// Plain-three port of the prototype's "3D sigil" block (index.html:467-557). Lazy chunk: only reached via import() in SigilCanvas.
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { getAssetPath } from '@/lib/basePath'

type St = { x: number; y: number; s: number; solid: number; wire: number; pts: number; face: number; ring: number }
const st = (x: number, y: number, s: number, solid: number, wire: number, pts: number, face: number, ring: number): St => ({ x, y, s, solid, wire, pts, face, ring })

/** data-sigil="<key>" -> [phone (<900px), desktop]. Values are the prototype's, verbatim (index.html:473-480). */
const PRESETS: Record<string, [St, St]> = {
  off:     [st(0, 0, 1, 0, 0, 0, 1, 0),        st(0, 0, 1, 0, 0, 0, 1, 0)],
  hero:    [st(0, .1, 1, 1, 0, 0, 0, 1),       st(0, .02, 1, 1, 0, 0, 0, 1)],
  slam:    [st(0, 0, 2.6, 0, 0, .4, 1, 0),     st(0, 0, 2.3, 0, 0, .55, 1, 0)],
  up:      [st(0, 0, 1.1, 0, .06, 0, .8, .2),  st(.66, .52, .42, 1, 0, 0, 0, 1)],
  recap:   [st(0, 0, 2.2, 0, 0, .08, 1, 0),    st(0, 0, 2.2, 0, 0, .14, 1, 0)],
  artists: [st(0, 0, 1, 0, .05, 0, .5, 0),     st(.3, 0, .95, 0, .2, 0, .3, .5)],
  word:    [st(0, 0, 1.2, 0, 0, .07, 1, 0),    st(-.56, 0, 1.1, 0, .1, .3, .6, .4)],
  pass:    [st(0, -.5, .95, 0, .1, 0, 1, .5),  st(.5, 0, 1.02, .55, .3, 0, 1, 1)],
  footer:  [st(0, -.2, 1.5, 0, .08, .1, 1, 0), st(0, -.2, 1.5, 0, .08, .1, 1, 0)],
}
const KEYS = Object.keys(PRESETS.off[0]) as (keyof St)[]

// Calibration knobs
const BEAT = 60 / 144        // 144 BPM
const DPR_FINE = 1.75        // prototype value
const DPR_COARSE = 1.5       // phones: drop to 1.25 / 1 if a mid-range Android cannot hold 50fps in the hero
const DEPTH = 2.2            // z exaggeration, prototype value
const STILL_FILL = 0.86      // share of the logo-sigil.png box the mark actually covers (measured 0.89 w / 0.84 h)

async function loadGeometry() {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(getAssetPath('/sigil.glb'))
  gltf.scene.updateMatrixWorld(true)
  const mesh = gltf.scene.getObjectByProperty('isMesh', true) as THREE.Mesh | undefined
  if (!mesh) throw new Error('sigil.glb has no mesh')
  // Positions are quantized Int16: copy to Float32 while baking the node transforms. Never applyMatrix4 on the source attribute.
  const src = mesh.geometry.getAttribute('position'), pos = new Float32Array(src.count * 3), v = new THREE.Vector3()
  for (let i = 0; i < src.count; i++) v.fromBufferAttribute(src, i).applyMatrix4(mesh.matrixWorld).toArray(pos, i * 3)
  const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pos, 3)).setIndex(mesh.geometry.index)
  geo.center()
  const size = geo.boundingBox!.getSize(v), k = 2 / Math.max(size.x, size.y)
  geo.scale(k, k, k * DEPTH)   // unit half-extent, like the prototype's baked data
  geo.computeVertexNormals()
  return geo
}

export async function mountSigil(canvas: HTMLCanvasElement): Promise<() => void> {
  const geo = await loadGeometry()   // before the renderer: a failed fetch never creates a GL context
  const root = document.documentElement, coarse = matchMedia('(pointer: coarse)').matches
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })   // throws without WebGL
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? DPR_COARSE : DPR_FINE))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, .1, 50); cam.position.z = 6
  const pm = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment(renderer), env = pm.fromScene(room, .04)
  scene.environment = env.texture; pm.dispose(); room.dispose()

  const chrome = new THREE.MeshStandardMaterial({ color: 0xcc0000, emissive: 0x400000, emissiveIntensity: .6, metalness: 1, roughness: .16, envMapIntensity: 1.15, transparent: true })
  const wireM = new THREE.MeshBasicMaterial({ color: 0xff3b30, wireframe: true, transparent: true, opacity: 0, depthWrite: false })
  const ptsM = new THREE.PointsMaterial({ color: 0xff3b30, size: .014, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
  const g = new THREE.Group(), spin = new THREE.Group()
  const solid = new THREE.Mesh(geo, chrome), wire = new THREE.Mesh(geo, wireM), pts = new THREE.Points(geo, ptsM)
  spin.add(solid, wire, pts); g.add(spin); scene.add(g)

  const ringM = new THREE.LineBasicMaterial({ color: 0xff3b30, transparent: true, opacity: .5 }), rings = new THREE.Group()
  ;[1.22, 1.3].forEach((r, k) => {   // k=0: closed circle r=1.22 (240 segments); k=1: 72 radial ticks r=1.30..1.35
    const p: number[] = [], n = k ? 72 : 240
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, a2 = k ? a : (i + 1) / n * Math.PI * 2, r2 = k ? r + .05 : r; p.push(Math.cos(a) * r, Math.sin(a) * r, 0, Math.cos(a2) * r2, Math.sin(a2) * r2, 0) }
    rings.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(p, 3)), ringM))
  })
  g.add(rings)

  const EN = 260, ep = new Float32Array(EN * 3), es = new Float32Array(EN)
  for (let i = 0; i < EN; i++) { ep[i * 3] = (Math.random() - .5) * 9; ep[i * 3 + 1] = (Math.random() - .5) * 6; ep[i * 3 + 2] = (Math.random() - .5) * 4 - 1; es[i] = .1 + Math.random() * .35 }
  const eg = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(ep, 3))
  const emberM = new THREE.PointsMaterial({ color: 0xff2a1f, size: .022, transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending })
  scene.add(new THREE.Points(eg, emberM))

  const key = new THREE.PointLight(0xff1a10, 90, 0, 2); key.position.set(0, 4, 5)
  const rim = new THREE.PointLight(0x00e5ff, 14, 0, 2); rim.position.set(-5, -2, -3)
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, .25))

  // ---- stations: every [data-sigil] element in the document, re-read on resize / route change / layout growth
  let stations: { c: number; st: St }[] = [], hw = 1, hh = 1, base = 1
  const measure = () => {
    const vh = innerHeight, cw = canvas.clientWidth, ch = canvas.clientHeight, m = innerWidth >= 900 ? 1 : 0
    const els = [...document.querySelectorAll<HTMLElement>('[data-sigil]')]
      .map((el) => { const r = el.getBoundingClientRect(), top = r.top + scrollY; return { el, top, h: r.height, c: top + Math.min(r.height, vh) / 2 } })
      .filter((e) => e.h > 0).sort((a, b) => a.c - b.c)
    if (els[0]) els[0].c = vh / 2   // first station is exact at scrollY 0 (prototype :484)
    stations = els.flatMap(({ el, top, h, c }) => {
      let s = (PRESETS[el.dataset.sigil ?? ''] ?? PRESETS.off)[m]
      const a = el.querySelector<HTMLElement>('[data-sigil-still]')?.getBoundingClientRect()
      if (a?.width) {   // land on the still this station replaces, so the still -> live swap does not jump
        const ay = a.top + scrollY + a.height / 2 - (c - vh / 2)   // its viewport y when this station is centred
        s = { ...s, x: (a.left + a.width / 2) / cw * 2 - 1, y: 1 - ay / ch * 2, s: a.width * STILL_FILL / ch * hh / base }
      }
      return h > vh * 1.5 ? [{ c, st: s }, { c: top + h - vh / 2, st: s }] : [{ c, st: s }]   // long sections hold their state (prototype :483)
    })
  }
  const target = (): St => {
    if (!stations.length) return PRESETS.off[0]
    const sc = scrollY + innerHeight / 2; let i = 0
    while (i < stations.length - 2 && sc > stations[i + 1].c) i++
    const a = stations[i], b = stations[i + 1] ?? a
    let t = Math.min(1, Math.max(0, (sc - a.c) / (b.c - a.c || 1))); t = t * t * (3 - 2 * t)
    const o = { ...a.st }; for (const p of KEYS) o[p] = a.st[p] + (b.st[p] - a.st[p]) * t
    return o
  }
  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight
    renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix()
    hh = Math.tan(cam.fov * Math.PI / 360) * cam.position.z; hw = hh * cam.aspect; base = Math.min(1.12, hw * .86, hh * .7)
    measure()
  }
  size()

  let kick = 0, mx = 0, my = 0, rot = 0, vel = 0, lastY = scrollY, last = performance.now(), n = 0, live = false
  const ac = new AbortController(), on = { signal: ac.signal, passive: true }
  const ro = new ResizeObserver((es) => (es.some((e) => e.target === canvas) ? size() : measure()))
  ro.observe(canvas); ro.observe(document.body)
  addEventListener('sigil:measure', measure, on)
  addEventListener('sigil:kick', () => { kick = 1 }, on)
  document.addEventListener('mouseover', (e) => { const c = (e.target as Element).closest?.('[data-kick]'); if (c && !c.contains(e.relatedTarget as Node | null)) kick = 1 }, on)
  if (!coarse) addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1 }, on)
  const stop = () => { renderer.setAnimationLoop(null); root.classList.remove('sigil-live') }
  canvas.addEventListener('webglcontextlost', stop, on)   // no restore: the still takes over for the rest of the visit

  const S: St = { ...target(), solid: 0, pts: 1, s: 2.8, ring: 0 }   // intro: a point cloud condenses into the sigil (prototype :535)
  renderer.setAnimationLoop((now: number) => {
    if (root.dataset.sigilPause !== undefined) { last = now; return }   // full-screen overlays set <html data-sigil-pause>
    if (coarse && S.solid < .01 && n++ % 2) return   // ponytail: ghost states run at half rate on phones; delete if profiling says it is not needed
    const d = Math.min(.05, (now - last) / 1000), time = now / 1000, tg = target(), k = 1 - Math.pow(.0015, d); last = now
    for (const p of KEYS) S[p] += (tg[p] - S[p]) * k
    vel += ((scrollY - lastY) / Math.max(d, .001) - vel) * .1; lastY = scrollY
    rot += d * (.35 + Math.min(4, Math.abs(vel) / 500))
    const near = Math.round(rot / (Math.PI * 2)) * Math.PI * 2
    spin.rotation.y = rot + (near - rot) * S.face
    g.rotation.x += (-my * .32 - g.rotation.x) * .06; g.rotation.y += (mx * .45 - g.rotation.y) * .06
    kick *= .9
    g.position.set(S.x * hw + (Math.random() - .5) * .12 * kick, S.y * hh + (Math.random() - .5) * .08 * kick, 0)
    const beat = Math.exp(-((time % BEAT) / BEAT) * 5) * S.solid
    g.scale.setScalar(base * S.s * (1 + .045 * beat))
    chrome.opacity = S.solid; solid.visible = S.solid > .01; wireM.opacity = S.wire; wire.visible = S.wire > .01; ptsM.opacity = S.pts; pts.visible = S.pts > .01
    ringM.opacity = (.5 + .35 * beat) * S.ring; rings.visible = S.ring > .01; rings.children[0].rotation.z = time * .08; rings.children[1].rotation.z = -time * .05
    key.intensity = 90 + beat * 80 + kick * 160
    for (let i = 0; i < EN; i++) { ep[i * 3 + 1] += es[i] * d; if (ep[i * 3 + 1] > 3.2) ep[i * 3 + 1] = -3.2 }
    eg.attributes.position.needsUpdate = true
    renderer.render(scene, cam)
    if (!live) { live = true; root.classList.add('sigil-live') }   // CSS fades [data-sigil-still] out
  })

  return () => {
    stop(); ac.abort(); ro.disconnect()
    scene.traverse((o) => { (o as THREE.Mesh).geometry?.dispose() })
    ;[chrome, wireM, ptsM, ringM, emberM].forEach((mat) => mat.dispose())
    env.dispose(); renderer.dispose()
  }
}
