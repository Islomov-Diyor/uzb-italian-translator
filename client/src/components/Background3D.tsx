import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PURPLE = '#7c3aed'
const INDIGO = '#4f46e5'
const VIOLET = '#8b5cf6'

function Column({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const speed = useMemo(() => Math.random() * 0.0004 + 0.0001, [])
  const drift = useMemo(
    () => ({ x: (Math.random() - 0.5) * 0.0004, y: (Math.random() - 0.5) * 0.0002 }),
    []
  )
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y += speed
    ref.current.position.x += drift.x
    ref.current.position.y += drift.y
    if (ref.current.position.x > 18) ref.current.position.x = -18
    if (ref.current.position.x < -18) ref.current.position.x = 18
    if (ref.current.position.y > 12) ref.current.position.y = -12
    if (ref.current.position.y < -12) ref.current.position.y = 12
  })
  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.12, 0.18, 3.5, 6]} />
      <meshBasicMaterial color={PURPLE} wireframe transparent opacity={0.25} />
    </mesh>
  )
}

function Arch({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const speed = useMemo(() => (Math.random() - 0.5) * 0.0006, [])
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.x += speed * 0.7
    ref.current.rotation.z += speed
  })
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[1.2, 0.06, 8, 32, Math.PI]} />
      <meshBasicMaterial color={INDIGO} wireframe transparent opacity={0.3} />
    </mesh>
  )
}

function Gem({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const rot = useMemo(
    () => ({ x: (Math.random() - 0.5) * 0.0008, y: (Math.random() - 0.5) * 0.001 }),
    []
  )
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.x += rot.x
    ref.current.rotation.y += rot.y
  })
  const size = useMemo(() => 0.6 + Math.random() * 0.4, [])
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[size, 0]} />
      <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.35} />
    </mesh>
  )
}

function Mountain({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const speed = useMemo(() => (Math.random() - 0.5) * 0.0003, [])
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y += speed
  })
  return (
    <mesh ref={ref} position={position}>
      <coneGeometry args={[0.8, 2.2, 5]} />
      <meshBasicMaterial color={INDIGO} wireframe transparent opacity={0.2} />
    </mesh>
  )
}

function Ring({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const speed = useMemo(() => (Math.random() - 0.5) * 0.0008, [])
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.x += speed
    ref.current.rotation.y += speed * 0.6
  })
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[1.5, 0.05, 6, 40]} />
      <meshBasicMaterial color={PURPLE} wireframe transparent opacity={0.2} />
    </mesh>
  )
}

function Icosa({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)
  const rot = useMemo(
    () => ({ x: (Math.random() - 0.5) * 0.0005, y: (Math.random() - 0.5) * 0.0007 }),
    []
  )
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.x += rot.x
    ref.current.rotation.y += rot.y
  })
  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[0.5, 0]} />
      <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.25} />
    </mesh>
  )
}

function Scene() {
  const columns = useMemo(
    () =>
      Array.from({ length: 10 }, () => [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 18,
        -5 - Math.random() * 10,
      ] as [number, number, number]),
    []
  )
  const arches = useMemo(
    () =>
      Array.from({ length: 6 }, () => [
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 16,
        -6 - Math.random() * 8,
      ] as [number, number, number]),
    []
  )
  const gems = useMemo(
    () =>
      Array.from({ length: 10 }, () => [
        (Math.random() - 0.5) * 32,
        (Math.random() - 0.5) * 20,
        -4 - Math.random() * 12,
      ] as [number, number, number]),
    []
  )
  const mountains = useMemo(
    () =>
      Array.from({ length: 7 }, () => [
        (Math.random() - 0.5) * 30,
        -4 - Math.random() * 8,
        -7 - Math.random() * 8,
      ] as [number, number, number]),
    []
  )
  const rings = useMemo(
    () =>
      Array.from({ length: 5 }, () => [
        (Math.random() - 0.5) * 26,
        (Math.random() - 0.5) * 14,
        -8 - Math.random() * 6,
      ] as [number, number, number]),
    []
  )
  const icosas = useMemo(
    () =>
      Array.from({ length: 8 }, () => [
        (Math.random() - 0.5) * 28,
        (Math.random() - 0.5) * 18,
        -5 - Math.random() * 10,
      ] as [number, number, number]),
    []
  )

  return (
    <>
      <ambientLight intensity={0.1} />
      {columns.map((p, i) => <Column key={`col-${i}`} position={p} />)}
      {arches.map((p, i) => <Arch key={`arch-${i}`} position={p} />)}
      {gems.map((p, i) => <Gem key={`gem-${i}`} position={p} />)}
      {mountains.map((p, i) => <Mountain key={`mtn-${i}`} position={p} />)}
      {rings.map((p, i) => <Ring key={`ring-${i}`} position={p} />)}
      {icosas.map((p, i) => <Icosa key={`ico-${i}`} position={p} />)}
    </>
  )
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: '#0a0a0f' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
