'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
  InstancedMesh,
  ShaderMaterial,
  Vector3,
  Mesh,
  CanvasTexture,
  LinearFilter,
  InstancedBufferAttribute,
  Object3D,
  MathUtils,
  Color,
  AdditiveBlending,
  DoubleSide,
} from 'three'
import { getAssetPath } from '@/lib/basePath'
import { generateSymbolAtlas } from '@/lib/generateSymbolAtlas'
import { getBass, getIsSwitching, getCurrentChannel, getBeatPhase } from '@/hooks/useAudioEngine'

// ============================================
// SHADER CODE
// ============================================

const swarmVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uBass;
  uniform float uAggregation;

  attribute vec3 aHomePosition;
  attribute vec3 aVelocity;
  attribute float aSymbolIndex;
  attribute float aPhase;

  varying vec2 vUv;
  varying float vSymbolIndex;
  varying float vOpacity;

  // Simplex noise helpers
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // Curl noise for organic swirling movement
  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    float n1 = snoise(p + dy) - snoise(p - dy);
    float n2 = snoise(p + dz) - snoise(p - dz);
    float n3 = snoise(p + dx) - snoise(p - dx);
    float n4 = snoise(p + dz) - snoise(p - dz);
    float n5 = snoise(p + dx) - snoise(p - dx);
    float n6 = snoise(p + dy) - snoise(p - dy);

    return normalize(vec3(n1 - n2, n3 - n4, n5 - n6));
  }

  void main() {
    // Chaos position (when uAggregation = 0)
    vec3 noiseInput = aHomePosition * 0.5 + uTime * 0.3;
    vec3 curl = curlNoise(noiseInput) * 2.5;
    vec3 chaosPos = aHomePosition + curl;
    chaosPos += sin(uTime * 1.5 + aPhase * 6.28) * aVelocity * 0.8;

    // Lerp between chaos and home based on aggregation
    vec3 finalPos = mix(chaosPos, aHomePosition, uAggregation);

    // Bass pulse: explode slightly on kick
    float bassExplosion = uBass * (1.0 - uAggregation * 0.7) * 0.4;
    finalPos += normalize(aHomePosition + vec3(0.001)) * bassExplosion;

    // Scale with flicker and bass pulse
    float scale = 0.06 + sin(uTime * 8.0 + aPhase * 6.28) * 0.015;
    scale *= 1.0 + uBass * 0.4;
    scale *= 0.7 + uAggregation * 0.3; // Smaller when scattered

    // Billboard: always face camera
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    mvPosition.xy += position.xy * scale;

    gl_Position = projectionMatrix * mvPosition;

    vUv = uv;
    vSymbolIndex = aSymbolIndex;
    vOpacity = 0.2 + uAggregation * 0.8; // More opaque when formed
  }
`

const swarmFragmentShader = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform float uAggregation;
  uniform float uBass;
  uniform vec3 uChannelColor;

  varying vec2 vUv;
  varying float vSymbolIndex;
  varying float vOpacity;

  void main() {
    // Calculate UV offset for symbol in atlas (4x4 grid)
    float col = mod(vSymbolIndex, 4.0);
    float row = floor(vSymbolIndex / 4.0);
    vec2 atlasUv = (vUv + vec2(col, 3.0 - row)) / 4.0; // Flip row for correct orientation

    vec4 texColor = texture2D(uAtlas, atlasUv);

    // Color: channel color when formed, matrix green when chaotic
    vec3 chaosColor = vec3(0.0, 1.0, 0.4);  // Matrix green
    vec3 formedColor = uChannelColor;
    vec3 finalColor = mix(chaosColor, formedColor, uAggregation);

    // Boost brightness on bass hit
    finalColor += uBass * 0.3;

    // Discard nearly transparent pixels
    if (texColor.a < 0.1) discard;

    gl_FragColor = vec4(finalColor, texColor.a * vOpacity);
  }
`

// ============================================
// PARTICLE SWARM COMPONENT
// ============================================

interface ParticleSwarmProps {
  hoveredNav?: string | null
}

export function ParticleSwarm({ hoveredNav }: ParticleSwarmProps) {
  const meshRef = useRef<InstancedMesh>(null!)
  const materialRef = useRef<ShaderMaterial>(null!)
  const modelPath = getAssetPath('/logo.glb')

  // Animation state
  const [hasStarted, setHasStarted] = useState(false)
  const entryProgress = useRef(0)
  const currentAggregation = useRef(0)
  const targetAggregation = useRef(0)
  const smoothBass = useRef(0)

  // Load GLB and extract vertex positions
  const { scene } = useGLTF(modelPath, true)

  const { homePositions, velocities, symbolIndices, phases, particleCount } = useMemo(() => {
    const points: Vector3[] = []

    scene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh
        const geo = mesh.geometry
        const posAttr = geo.getAttribute('position')

        // Get world matrix to transform vertices
        mesh.updateWorldMatrix(true, false)
        const worldMatrix = mesh.matrixWorld

        for (let i = 0; i < posAttr.count; i++) {
          const v = new Vector3(
            posAttr.getX(i),
            posAttr.getY(i),
            posAttr.getZ(i)
          )
          v.applyMatrix4(worldMatrix)
          points.push(v)
        }
      }
    })

    // If we have too few points, duplicate them
    const targetCount = Math.max(points.length, 5000)
    while (points.length < targetCount) {
      const idx = Math.floor(Math.random() * points.length)
      const p = points[idx].clone()
      // Add slight jitter for duplicates
      p.x += (Math.random() - 0.5) * 0.02
      p.y += (Math.random() - 0.5) * 0.02
      p.z += (Math.random() - 0.5) * 0.02
      points.push(p)
    }

    // Limit to reasonable count for performance
    const maxCount = Math.min(points.length, 15000)
    const finalPoints = points.slice(0, maxCount)

    const homePos = new Float32Array(maxCount * 3)
    const vels = new Float32Array(maxCount * 3)
    const symbols = new Float32Array(maxCount)
    const phs = new Float32Array(maxCount)

    finalPoints.forEach((p, i) => {
      homePos[i * 3] = p.x
      homePos[i * 3 + 1] = p.y
      homePos[i * 3 + 2] = p.z

      // Random velocity for chaos state
      vels[i * 3] = (Math.random() - 0.5) * 2
      vels[i * 3 + 1] = (Math.random() - 0.5) * 2
      vels[i * 3 + 2] = (Math.random() - 0.5) * 2

      // Random symbol from atlas (0-15)
      symbols[i] = Math.floor(Math.random() * 16)

      // Random phase offset for animation variation
      phs[i] = Math.random()
    })

    return {
      homePositions: homePos,
      velocities: vels,
      symbolIndices: symbols,
      phases: phs,
      particleCount: maxCount,
    }
  }, [scene])

  // Create texture atlas
  const atlasTexture = useMemo(() => {
    if (typeof window === 'undefined') return null
    const canvas = generateSymbolAtlas()
    const tex = new CanvasTexture(canvas)
    tex.minFilter = LinearFilter
    tex.magFilter = LinearFilter
    return tex
  }, [])

  // Start entry animation after short delay
  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), 500)
    return () => clearTimeout(timer)
  }, [])

  // Set up instanced attributes
  useEffect(() => {
    if (!meshRef.current) return

    const geometry = meshRef.current.geometry

    geometry.setAttribute(
      'aHomePosition',
      new InstancedBufferAttribute(homePositions, 3)
    )
    geometry.setAttribute(
      'aVelocity',
      new InstancedBufferAttribute(velocities, 3)
    )
    geometry.setAttribute(
      'aSymbolIndex',
      new InstancedBufferAttribute(symbolIndices, 1)
    )
    geometry.setAttribute(
      'aPhase',
      new InstancedBufferAttribute(phases, 1)
    )

    // Set instance matrices to identity (positions handled in shader)
    const dummy = new Object3D()
    for (let i = 0; i < particleCount; i++) {
      dummy.position.set(0, 0, 0)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [homePositions, velocities, symbolIndices, phases, particleCount])

  // Easing function
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

  // Animation loop
  useFrame((state, delta) => {
    if (!materialRef.current || !atlasTexture) return

    const bass = getBass()
    const beatPhase = getBeatPhase()
    const isSwitching = getIsSwitching()
    const channel = getCurrentChannel()

    // Smooth bass
    smoothBass.current = MathUtils.lerp(smoothBass.current, bass, 0.3)

    // Entry animation: scattered -> aggregate over 3 seconds
    if (hasStarted && entryProgress.current < 1) {
      entryProgress.current = Math.min(1, entryProgress.current + delta / 3)
    }

    // Determine aggregation target
    const entryAggregation = easeOutCubic(entryProgress.current)

    if (entryProgress.current >= 1) {
      // Audio-reactive after entry completes
      const kickThreshold = 0.5
      if (smoothBass.current > kickThreshold || isSwitching) {
        targetAggregation.current = 0.4 // Explode on kick
      } else {
        targetAggregation.current = 0.75 + beatPhase * 0.25 // Reform between beats
      }
    } else {
      targetAggregation.current = entryAggregation
    }

    // Smooth lerp to target
    const lerpSpeed = smoothBass.current > 0.5 || isSwitching ? 0.15 : 0.03
    currentAggregation.current = MathUtils.lerp(
      currentAggregation.current,
      targetAggregation.current,
      lerpSpeed
    )

    // Hover effect: slight scatter on nav hover
    if (hoveredNav) {
      currentAggregation.current *= 0.9
    }

    // Update uniforms
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    materialRef.current.uniforms.uBass.value = smoothBass.current
    materialRef.current.uniforms.uAggregation.value = currentAggregation.current
    materialRef.current.uniforms.uChannelColor.value.set(channel.color)
  })

  if (!atlasTexture) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, particleCount]}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTime: { value: 0 },
          uBass: { value: 0 },
          uAggregation: { value: 0 },
          uAtlas: { value: atlasTexture },
          uChannelColor: { value: new Color('#cc0000') },
        }}
        vertexShader={swarmVertexShader}
        fragmentShader={swarmFragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        side={DoubleSide}
      />
    </instancedMesh>
  )
}
