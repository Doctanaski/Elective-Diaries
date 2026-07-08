'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

/* ── The actual rotating model ── */
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  const ref = useRef<THREE.Group>(null)

  // Auto-rotate smoothly
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.35
    }
  })

  // Centre and normalise the model's bounding box so any .glb fits nicely
  const box = new THREE.Box3().setFromObject(scene)
  const centre = new THREE.Vector3()
  box.getCenter(centre)
  scene.position.sub(centre)

  const size = box.getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = 2.2 / maxDim   // fit inside a ~2.2 unit sphere

  return (
    <group ref={ref} scale={scale}>
      <primitive object={scene} />
    </group>
  )
}

/* ── Exported component ── */
interface Props {
  url: string
}

export default function DiaryModel3D({ url }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]}  intensity={1.2} />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#ff4444" />
      <pointLight position={[0, 4, 0]} intensity={0.8} color="#ffffff" />

      {/* Environment for realistic reflections */}
      <Environment preset="night" />

      {/* Suspense hides everything until the model is loaded */}
      <Suspense fallback={null}>
        <Model url={url} />
      </Suspense>

      {/* Optional subtle orbit on drag — disabled auto-rotate (we handle it in Model) */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        enableRotate={true}
        rotateSpeed={0.6}
      />
    </Canvas>
  )
}
