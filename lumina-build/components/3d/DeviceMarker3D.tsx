import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface DeviceMarker3DProps {
  position: [number, number, number]
  device: {
    id: string
    name: string
    type: string
    status: 'on' | 'off' | 'online' | 'offline'
    value?: string
  }
  onClick?: (deviceId: string) => void
}

export default function DeviceMarker3D({ position, device, onClick }: DeviceMarker3DProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)

  // Animate marker
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  // Color based on device status
  const getDeviceColor = () => {
    switch (device.status) {
      case 'on': return '#00ff00'      // Green
      case 'off': return '#ff4444'     // Red  
      case 'online': return '#4444ff'  // Blue
      case 'offline': return '#888888' // Gray
      default: return '#ffffff'        // White
    }
  }

  // Device icon based on type
  const getDeviceIcon = () => {
    switch (device.type.toLowerCase()) {
      case 'switch': return '💡'
      case 'dimmer': return '🔆'
      case 'sensor': return '📱'
      case 'camera': return '📹'
      case 'lock': return '🔒'
      case 'thermostat': return '🌡️'
      default: return '📱'
    }
  }

  return (
    <group position={position}>
      {/* Device marker sphere */}
      <Sphere
        ref={meshRef}
        args={[0.2]}
        onClick={() => onClick?.(device.id)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={getDeviceColor()}
          emissive={getDeviceColor()}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transparent
          opacity={hovered ? 0.8 : 0.6}
        />
      </Sphere>

      {/* Device info popup */}
      {hovered && (
        <Html
          position={[0, 0.5, 0]}
          center
          distanceFactor={10}
          style={{
            background: 'rgba(0,0,0,0.8)',
            padding: '8px 12px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          <div>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>
              {getDeviceIcon()} {device.name}
            </div>
            <div style={{ opacity: 0.8 }}>
              Status: {device.status}
              {device.value && ` • ${device.value}`}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}