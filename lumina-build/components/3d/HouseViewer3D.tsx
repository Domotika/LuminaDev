import React, { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import { preloadGLBModel } from '../../services/proxyService'

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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug: log props
  console.log('[3D Debug] Props:', { hubIp, modelFileName });

  useEffect(() => {
    const loadModel = async () => {
      if (!hubIp) {
        setError('Hub IP não configurado. Vá em Settings → Conexão Maker API');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`[3D Model] Loading model: ${modelFileName} from ${hubIp}`);
        
        // Preload GLB as blob to avoid Mixed Content
        const url = await preloadGLBModel(hubIp, modelFileName);
        setBlobUrl(url);
        setLoading(false);
        
      } catch (err: any) {
        console.error('[3D Model] Failed to load:', err);
        setError(`Erro ao carregar modelo: ${err.message}`);
        setLoading(false);
      }
    };

    loadModel();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [hubIp, modelFileName]);

  if (loading) {
    return (
      <div className={`w-full h-96 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-lg">Carregando modelo 3D...</div>
          <div className="text-sm text-gray-400 mt-1">{modelFileName}</div>
        </div>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className={`w-full h-96 bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <div className="text-red-400 text-lg mb-2">❌ Falha no carregamento</div>
          <div className="text-sm text-gray-400">{error}</div>
          <div className="text-xs text-gray-500 mt-2">
            Verifique se o arquivo {modelFileName} está no File Manager
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-96 bg-gray-900 rounded-lg overflow-hidden relative ${className}`}>
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
          <HouseModel modelPath={blobUrl} />
          
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
      
      {/* Info overlay */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        🏠 {modelFileName}
      </div>
    </div>
  )
}