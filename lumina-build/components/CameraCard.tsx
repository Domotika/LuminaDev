import React, { useState, useEffect, useRef } from 'react';
import { IPCamera } from '../types';
import { GlassCard } from './GlassCard';
import { Camera, Video, RefreshCw, Maximize2, X, Trash2, ExternalLink, PenLine, Key } from 'lucide-react';

interface CameraCardProps {
  camera: IPCamera;
  onRemove?: (cameraId: string) => void;
  onEdit?: (camera: IPCamera) => void;
  compact?: boolean; // Para exibição na grid da Home
}

const MAX_RETRIES = 3;

export const CameraCard: React.FC<CameraCardProps> = ({ camera, onRemove, onEdit, compact = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [useIframe, setUseIframe] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isRtsp = camera.streamType === 'rtsp';
  const isMjpeg = camera.streamType === 'mjpeg';
  const hasPreview = isRtsp ? !!camera.snapshotUrl : true;
  const previewUrl = isRtsp ? camera.snapshotUrl : camera.url;
  const refreshMs = (camera.refreshInterval || 10) * 1000;

  // Auto-refresh para snapshot (não para MJPEG ou iframe mode)
  useEffect(() => {
    if (isMjpeg || !hasPreview || useIframe) return; // MJPEG atualiza sozinho, iframe não precisa refresh
    
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, refreshMs);

    return () => clearInterval(interval);
  }, [isMjpeg, hasPreview, refreshMs, useIframe]);

  // Adiciona timestamp para evitar cache (apenas snapshot)
  const getImageUrl = () => {
    if (!previewUrl) return '';
    if (isMjpeg) return previewUrl;
    const separator = previewUrl.includes('?') ? '&' : '?';
    return `${previewUrl}${separator}_t=${lastUpdate}`;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0); // Reset retry count on success
  };

  const handleImageError = () => {
    if (retryCount < MAX_RETRIES) {
      // Retry after a short delay
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        setLastUpdate(Date.now());
      }, 1000 * (retryCount + 1)); // Increasing delay: 1s, 2s, 3s
    } else {
      setIsLoading(false);
      setHasError(true);
      setNeedsAuth(true); // Probably needs authentication
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
    setNeedsAuth(false);
    setUseIframe(false); // Try img first
    setLastUpdate(Date.now());
  };

  // Opens camera URL in new tab to trigger browser auth, then switches to iframe mode
  const handleAuthenticate = () => {
    window.open(previewUrl, '_blank', 'width=800,height=600');
    // After auth, switch to iframe mode which handles credentials better
    setTimeout(() => {
      setUseIframe(true);
      setHasError(false);
      setIsLoading(false);
      setNeedsAuth(false);
    }, 3000);
  };

  const handleOpenStream = () => {
    // Para RTSP, tenta abrir no player externo
    // Para outros tipos, abre a URL diretamente
    window.open(camera.url, '_blank');
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  // Listener para sair do fullscreen com ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const cardHeight = compact ? 'h-40' : 'h-52';

  // RTSP sem preview - mostrar apenas botão de abrir stream
  if (isRtsp && !hasPreview) {
    return (
      <div ref={containerRef}>
        <GlassCard className={`relative overflow-hidden ${cardHeight} group`}>
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-purple-500/50 rounded text-[8px] font-bold text-white">RTSP</span>
                <span className="text-xs font-medium text-white drop-shadow-md">{camera.name}</span>
              </div>
              {onRemove && (
                <button 
                  onClick={() => onRemove(camera.id)}
                  className="p-1.5 rounded-full bg-red-500/40 hover:bg-red-500/60 text-white/70 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  title="Remover câmera"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* RTSP Only - Big Play Button */}
          <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-black flex items-center justify-center">
            <button 
              onClick={handleOpenStream}
              className="flex flex-col items-center gap-3 p-6 bg-white/10 rounded-2xl hover:bg-white/20 transition-all hover:scale-105 border border-white/10"
            >
              <div className="p-4 bg-purple-500/30 rounded-full">
                <Video size={32} className="text-purple-300" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-white block">Abrir Stream</span>
                <span className="text-[9px] text-white/50">VLC / Player Externo</span>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-white/50 truncate max-w-[70%]">{camera.url}</span>
              <ExternalLink size={12} className="text-white/30" />
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <GlassCard className={`relative overflow-hidden ${isFullscreen ? 'h-full rounded-none' : cardHeight} group`}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${hasError ? 'bg-red-500' : isLoading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`} />
              <span className="text-xs font-medium text-white drop-shadow-md">{camera.name}</span>
              {isMjpeg && (
                <span className="px-1.5 py-0.5 bg-blue-500/50 rounded text-[8px] font-bold text-white">MJPEG</span>
              )}
              {isRtsp && (
                <span className="px-1.5 py-0.5 bg-purple-500/50 rounded text-[8px] font-bold text-white">RTSP</span>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isMjpeg && (
                <button 
                  onClick={handleRefresh}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors"
                  title="Atualizar"
                >
                  <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                </button>
              )}
              {isRtsp && (
                <button 
                  onClick={handleOpenStream}
                  className="p-1.5 rounded-full bg-purple-500/40 hover:bg-purple-500/60 text-white/70 hover:text-white transition-colors"
                  title="Abrir RTSP no player"
                >
                  <ExternalLink size={12} />
                </button>
              )}
              <button 
                onClick={handleFullscreen}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors"
                title={isFullscreen ? "Sair" : "Tela cheia"}
              >
                {isFullscreen ? <X size={12} /> : <Maximize2 size={12} />}
              </button>
              {onEdit && !isFullscreen && (
                <button 
                  onClick={() => onEdit(camera)}
                  className="p-1.5 rounded-full bg-blue-500/40 hover:bg-blue-500/60 text-white/70 hover:text-white transition-colors"
                  title="Editar câmera"
                >
                  <PenLine size={12} />
                </button>
              )}
              {onRemove && !isFullscreen && (
                <button 
                  onClick={() => onRemove(camera.id)}
                  className="p-1.5 rounded-full bg-red-500/40 hover:bg-red-500/60 text-white/70 hover:text-white transition-colors"
                  title="Remover câmera"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Camera Feed */}
        <div className={`relative w-full h-full bg-black ${isFullscreen ? 'flex items-center justify-center' : ''}`}>
          {isLoading && !isMjpeg && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <RefreshCw size={24} className="text-white/50 animate-spin" />
            </div>
          )}
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white/50">
                <Camera size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">{needsAuth ? 'Autenticação necessária' : 'Erro ao carregar'}</p>
                <p className="text-[10px] mt-1 opacity-70 max-w-[200px] truncate">{previewUrl}</p>
                <div className="flex gap-2 mt-3 justify-center">
                  {needsAuth && (
                    <button 
                      onClick={handleAuthenticate}
                      className="px-3 py-1.5 bg-blue-500/30 hover:bg-blue-500/50 rounded text-[10px] flex items-center gap-1 text-blue-200"
                    >
                      <Key size={12} /> Autenticar
                    </button>
                  )}
                  <button 
                    onClick={handleRefresh}
                    className="px-3 py-1.5 bg-white/10 rounded text-[10px] hover:bg-white/20"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            </div>
          ) : useIframe ? (
            <div className="relative w-full h-full overflow-hidden bg-black">
              <iframe
                src={previewUrl}
                title={camera.name}
                className="absolute inset-0 border-0"
                scrolling="no"
                style={{ 
                  width: '100%',
                  height: '100%',
                  transform: 'scale(1.5)',
                  transformOrigin: 'center center',
                  pointerEvents: 'none'
                }}
              />
            </div>
          ) : (
            <img
              ref={imgRef}
              src={getImageUrl()}
              alt={camera.name}
              className={`w-full h-full ${isFullscreen ? 'object-contain max-h-screen' : 'object-cover'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>

        {/* Footer - Live indicator */}
        {!compact && !isFullscreen && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 bg-red-600 rounded text-[9px] font-bold text-white flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
                {isRtsp && (
                  <button 
                    onClick={handleOpenStream}
                    className="px-2 py-0.5 bg-purple-600/80 hover:bg-purple-600 rounded text-[9px] font-medium text-white flex items-center gap-1 transition-colors"
                  >
                    <Video size={10} />
                    RTSP
                  </button>
                )}
              </div>
              <span className="text-[9px] text-white/50">
                {isMjpeg ? 'Stream' : `Refresh: ${camera.refreshInterval}s`}
              </span>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default CameraCard;
