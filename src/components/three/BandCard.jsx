import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

extend({ MeshLineGeometry, MeshLineMaterial })

const GLTF_PATH = '/assets/kartu.glb'
const TEXTURE_PATH = '/assets/bandd.png'

useGLTF.preload(GLTF_PATH)
useTexture.preload(TEXTURE_PATH)

const finite = (v) => v && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z)

/**
 * Frames the card so it fits the container at any aspect ratio.
 * The card mesh is ~5 world units tall, so z must stay ≥ ~11 (visible
 * height = 2·z·tan(12.5°)) or the card gets vertically cropped.
 */
function FrameRig() {
  const { camera, size } = useThree()
  useEffect(() => {
    const a = size.width / Math.max(1, size.height)
    camera.position.z = THREE.MathUtils.clamp(15 - (a - 0.5) * 3, 11, 15.5)
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])
  return null
}

function Band({ maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef() // prettier-ignore
  const vec = new THREE.Vector3(), ang = new THREE.Vector3(), rot = new THREE.Vector3(), dir = new THREE.Vector3() // prettier-ignore
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 }
  const { nodes, materials } = useGLTF(GLTF_PATH)
  const texture = useTexture(TEXTURE_PATH)
  const { width, height } = useThree((state) => state.size)
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]))
  const [dragged, drag] = useState(false)
  const [hovered, hover] = useState(false)

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]) // prettier-ignore
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]) // prettier-ignore

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => void (document.body.style.cursor = 'auto')
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05) // clamp frame deltas → no NaN physics on hidden tabs
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      const kin = { x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z }
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      if (finite(kin)) card.current?.setNextKinematicTranslation(kin)
    }
    if (fixed.current) {
      ;[j1, j2].forEach((ref) => {
        const t = ref.current?.translation()
        if (!finite(t)) return
        if (!finite(ref.current.lerped)) ref.current.lerped = new THREE.Vector3().copy(t)
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(t)))
        ref.current.lerped.lerp(t, dt * (minSpeed + clampedDistance * (maxSpeed - minSpeed)))
      })
      const t3 = j3.current?.translation(), t2 = j2.current?.lerped, t1 = j1.current?.lerped, t0 = fixed.current?.translation()
      if (finite(t3) && finite(t2) && finite(t1) && finite(t0)) {
        curve.points[0].copy(t3)
        curve.points[1].copy(t2)
        curve.points[2].copy(t1)
        curve.points[3].copy(t0)
        band.current.geometry.setPoints(curve.getPoints(32))
      }
      const a = card.current?.angvel(), r = card.current?.rotation()
      if (finite(a) && finite(r)) {
        ang.copy(a)
        rot.copy(r)
        card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
      }
    }
  })

  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
            onPointerDown={(e) => {
              e.target.setPointerCapture(e.pointerId)
              const base = card.current?.translation()
              if (finite(base)) drag(new THREE.Vector3().copy(e.point).sub(vec.copy(base)))
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.3}
                metalness={0.5}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  )
}

export default function BandCard() {
  return (
    <div className="h-full w-full touch-none" role="img" aria-label="Thẻ 3D tương tác — kéo để xoay thẻ">
      <Canvas camera={{ position: [0, 0, 13], fov: 25 }} gl={{ antialias: true, alpha: true }}>
        <FrameRig />
        <ambientLight intensity={Math.PI} />
        <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
          <Band />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  )
}
