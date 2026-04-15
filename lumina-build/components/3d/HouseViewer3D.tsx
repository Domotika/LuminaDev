import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'

interface HouseModelProps {
  modelPath: string
}

function HouseModel({ modelPath }: HouseModelProps) {
  const { scene } = useGLTF(modelPath)
  return <primitive object={scene} scale={1} />
}

interface HouseViewer3DProps {
  className?: string
  hubIp?: string
  modelFileName?: string
  onDeviceClick?: (deviceId: string) => void
}

export default function HouseViewer3D({ 
  className = "",
  hubIp,
  modelFileName = "lumina_apartamento.glb",
  onDeviceClick 
}: HouseViewer3DProps) {
  // Dynamic model path from Hubitat File Manager
  const modelPath = hubIp 
    ? `http://${hubIp}/local/${modelFileName}`
    : `/local/${modelFileName}`; // Fallback to relative path
  return (
    <div className={`w-full h-96 bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        shadows
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* 3D Model */}
          <HouseModel modelPath={modelPath} />
          
          {/* Environment */}
          <Environment preset="apartment" />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
      
      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="text-white text-lg">Carregando modelo 3D...</div>
      </div>
    </div>
  )
}

// Note: Model preloading is handled dynamically based on Hubitat config