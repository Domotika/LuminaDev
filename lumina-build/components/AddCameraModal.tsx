import React, { useState, useEffect } from 'react';
import { IPCamera, CameraStreamType, Room } from '../types';
import { GlassCard } from './GlassCard';
import { Camera, X, Check, HelpCircle, Video } from 'lucide-react';

interface AddCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (camera: Omit<IPCamera, 'id' | 'order'>) => void;
  rooms: Room[];
  editingCamera?: IPCamera; // Se presente, está editando
}

export const AddCameraModal: React.FC<AddCameraModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  rooms,
  editingCamera 
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [streamType, setStreamType] = useState<CameraStreamType>('snapshot');
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [snapshotUrl, setSnapshotUrl] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  // Update form when editingCamera changes
  useEffect(() => {
    if (editingCamera) {
      setName(editingCamera.name || '');
      setUrl(editingCamera.url || '');
      setStreamType(editingCamera.streamType || 'snapshot');
      setRefreshInterval(editingCamera.refreshInterval || 10);
      setSnapshotUrl(editingCamera.snapshotUrl || '');
      setRoomId(editingCamera.roomId || '');
    } else {
      // Reset form for new camera
      setName('');
      setUrl('');
      setStreamType('snapshot');
      setRefreshInterval(10);
      setSnapshotUrl('');
      setRoomId('');
    }
  }, [editingCamera, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    onSave({
      name: name.trim(),
      url: url.trim(),
      streamType,
      refreshInterval,
      snapshotUrl: snapshotUrl.trim() || undefined,
      roomId: roomId || undefined
    });

    // Reset form
    setName('');
    setUrl('');
    setStreamType('snapshot');
    setRefreshInterval(10);
    setSnapshotUrl('');
    setRoomId('');
    onClose();
  };

  const getUrlPlaceholder = () => {
    switch (streamType) {
      case 'rtsp': return 'rtsp://usuario:senha@192.168.1.100:554/stream1';
      case 'mjpeg': return 'http://192.168.1.100:8080/video';
      default: return 'http://192.168.1.100/snapshot.jpg';
    }
  };

  const getUrlLabel = () => {
    switch (streamType) {
      case 'rtsp': return 'URL RTSP';
      case 'mjpeg': return 'URL MJPEG';
      default: return 'URL Snapshot';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <GlassCard className="w-full max-w-md bg-zinc-900 border-white/10 p-6 my-auto max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Camera size={20} className="text-blue-400" />
            {editingCamera ? 'Editar Câmera' : 'Adicionar Câmera IP'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">
              Nome da Câmera
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Entrada Principal"
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 text-sm"
              required
            />
          </div>

          {/* Tipo de Stream */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">
              Tipo de Stream
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStreamType('snapshot')}
                className={`py-3 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                  streamType === 'snapshot' 
                    ? 'bg-white text-black border-white' 
                    : 'bg-black/20 text-white/60 border-white/10 hover:bg-white/10'
                }`}
              >
                Snapshot
              </button>
              <button
                type="button"
                onClick={() => setStreamType('mjpeg')}
                className={`py-3 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                  streamType === 'mjpeg' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-black/20 text-white/60 border-white/10 hover:bg-white/10'
                }`}
              >
                MJPEG
              </button>
              <button
                type="button"
                onClick={() => setStreamType('rtsp')}
                className={`py-3 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                  streamType === 'rtsp' 
                    ? 'bg-purple-600 text-white border-purple-600' 
                    : 'bg-black/20 text-white/60 border-white/10 hover:bg-white/10'
                }`}
              >
                RTSP
              </button>
            </div>
            <p className="text-[9px] text-white/40 mt-2">
              {streamType === 'snapshot' && 'Imagem estática com refresh periódico (menor banda)'}
              {streamType === 'mjpeg' && 'Stream contínuo de vídeo no navegador'}
              {streamType === 'rtsp' && 'Abre em player externo (VLC). Configure snapshot para preview.'}
            </p>
          </div>

          {/* URL Principal */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold flex items-center gap-2">
              {getUrlLabel()}
              <button 
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="text-blue-400 hover:text-blue-300"
              >
                <HelpCircle size={12} />
              </button>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={getUrlPlaceholder()}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 text-sm font-mono"
              required
            />
            {showHelp && (
              <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] text-blue-200 leading-relaxed">
                <p className="font-bold mb-1">Exemplos de URL:</p>
                <p><strong>Snapshot:</strong> http://IP/snapshot.jpg</p>
                <p><strong>MJPEG:</strong> http://IP:8080/video</p>
                <p><strong>RTSP:</strong> rtsp://user:pass@IP:554/stream1</p>
                <p className="mt-2"><strong>Hikvision Snap:</strong> http://user:pass@IP/ISAPI/Streaming/channels/101/picture</p>
                <p><strong>Hikvision RTSP:</strong> rtsp://user:pass@IP:554/Streaming/Channels/101</p>
                <p><strong>Intelbras:</strong> http://user:pass@IP/cgi-bin/snapshot.cgi</p>
                <p><strong>Mibo RTSP:</strong> rtsp://user:pass@IP:554/live/ch0</p>
              </div>
            )}
          </div>

          {/* Snapshot URL (para RTSP) */}
          {streamType === 'rtsp' && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">
                URL Snapshot (Preview) - Opcional
              </label>
              <input
                type="text"
                value={snapshotUrl}
                onChange={(e) => setSnapshotUrl(e.target.value)}
                placeholder="http://192.168.1.100/snapshot.jpg"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 text-sm font-mono"
              />
              <p className="text-[9px] text-white/40 mt-1">
                URL HTTP para mostrar preview no dashboard. Sem isso, mostra apenas botão para abrir stream.
              </p>
            </div>
          )}

          {/* Intervalo de Refresh (para snapshot e rtsp com snapshot) */}
          {(streamType === 'snapshot' || (streamType === 'rtsp' && snapshotUrl)) && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">
                Intervalo de Atualização
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="300"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-mono bg-black/30 px-3 py-1 rounded min-w-[60px] text-center">
                  {refreshInterval}s
                </span>
              </div>
            </div>
          )}

          {/* Ambiente (opcional) */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/50 mb-2 font-semibold">
              Ambiente (Opcional)
            </label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30 text-sm"
            >
              <option value="">Nenhum (apenas na Home)</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>

          {/* RTSP Warning */}
          {streamType === 'rtsp' && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Video size={16} className="text-purple-400 mt-0.5" />
                <div className="text-[10px] text-purple-200">
                  <p className="font-bold">RTSP requer player externo</p>
                  <p className="text-purple-200/70 mt-1">
                    O botão "Abrir Stream" tentará abrir o VLC ou outro player instalado.
                    {!snapshotUrl && ' Configure uma URL de snapshot para ver preview no dashboard.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Check size={16} />
              {editingCamera ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};

export default AddCameraModal;
