'use client'

import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere } from '@react-three/drei'

function AnimatedOrb() {
    const mesh = useRef()

    useFrame(({ clock }) => {
        if (!mesh.current) return
        mesh.current.rotation.y += 0.004
        mesh.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.15
        mesh.current.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.12
    })

    return (
        <mesh ref={mesh}>
            <Sphere args={[1.5, 64, 64]}>
                <MeshDistortMaterial
                    color="#7B5EF8"
                    attach="material"
                    distort={0.38}
                    speed={2.5}
                    roughness={0}
                    metalness={0.85}
                />
            </Sphere>
        </mesh>
    )
}

function RingOrbit({ radius = 2.2, speed = 0.8, color = '#06B6D4' }) {
    const mesh = useRef()
    useFrame(({ clock }) => {
        if (!mesh.current) return
        mesh.current.rotation.z = clock.elapsedTime * speed
        mesh.current.rotation.x = Math.PI / 3
    })
    return (
        <mesh ref={mesh}>
            <torusGeometry args={[radius, 0.015, 8, 80]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.5} />
        </mesh>
    )
}

export default function HeroOrb({ className = '' }) {
    return (
        <div className={className} style={{ width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} style={{ background: 'transparent' }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[3, 3, 3]} color="#7B5EF8" intensity={3} />
                <pointLight position={[-3, -2, -2]} color="#06B6D4" intensity={1.5} />
                <pointLight position={[0, -3, 2]} color="#A78BFA" intensity={1} />
                <Suspense fallback={null}>
                    <AnimatedOrb />
                    <RingOrbit radius={2.2} speed={0.5} color="#06B6D4" />
                    <RingOrbit radius={2.6} speed={-0.3} color="#7B5EF8" />
                </Suspense>
            </Canvas>
        </div>
    )
}
