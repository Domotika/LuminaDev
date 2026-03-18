import React, { useState, useEffect, useRef } from 'react';
import { Device, DeviceType, Room } from '../types';
import { GlassCard } from './GlassCard';
import { sendHubitatCommand, getButtonMapping, saveButtonMapping } from '../services/hubitatService';
import { 
    Power, Volume2, VolumeX, Plus, Minus, 
    Play, Pause, Square, SkipBack, SkipForward,
    Radio, Bluetooth, Disc3, Usb, Monitor, Music2,
    Settings, Link, X, Save, Copy, PenLine, ArrowRightLeft, Trash2,
    Wifi, Speaker
} from 'lucide-react';

/**
 * SoundSmartRemote - Controle para caixas de som SoundSmart/Arylic
 * 
 * Capabilities do Driver:
 * - status: playing/stopped/paused
 * - volume: 0-100
 * - mute: muted/unmuted
 * - input: Spotify, Bluetooth, Óptico, Line In, USB, HDMI, Radio
 * - trackDescription: HTML com capa do álbum
 * - URLLargeCoverFile: URL da capa grande
 * 
 * Comandos suportados:
 * - play/pause/stop/nextTrack/previousTrack
 * - volumeUp/volumeDown/setVolume
 * - mute/unmute
 * - inputwifi/inputoptical/inputbluetooth/inputaux/inputusb/inputhdmi
 * - preset1-10
 */

interface SoundSmartRemoteProps {
  device: Device;
  onUpdate: (id: string, newState: Partial<Device['state']>) => void;
  onBeforeCommand?: () => void;
  allDevices: Device[]; 
  rooms?: Room[];
  onDuplicate?: (device: Device) => void;
  onRename?: (id: string, name: string) => void;
  onAssignAction?: (id: string, roomId: string) => void; 
  onDelete?: (id: string) => void;
}

const INPUTS = [
    { name: 'WiFi', icon: Wifi, command: 'inputwifi', color: 'text-green-400' },
    { name: 'Bluetooth', icon: Bluetooth, command: 'inputbluetooth', color: 'text-blue-400' },
    { name: 'Óptico', icon: Disc3, command: 'inputoptical', color: 'text-red-400' },
    { name: 'Line In', icon: Music2, command: 'inputaux', color: 'text-yellow-400' },
    { name: 'USB', icon: Usb, command: 'inputusb', color: 'text-orange-400' },
    { name: 'HDMI', icon: Monitor, command: 'inputhdmi', color: 'text-purple-400' },
];

export const SoundSmartRemote: React.FC<SoundSmartRemoteProps> = ({ 
    device, 
    onUpdate, 
    allDevices, 
    rooms = [], 
    onDuplicate, 
    onRename, 
    onAssignAction, 
    onDelete 
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [editingButtonId, setEditingButtonId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('none');
  const [volume, setVolume] = useState(device.state.level || 50);
  const [isDragging, setIsDragging] = useState(false);

  // Menu States
  const [showMenu, setShowMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [newName, setNewName] = useState(device.name);
  const [selectedRoomId, setSelectedRoomId] = useState(device.roomId);
  const menuRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      setMapping(getButtonMapping());
  }, []);

  useEffect(() => {
      if (!isDragging) {
          setVolume(device.state.level || 50);
      }
  }, [device.state.level, isDragging]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const saveMapping = (newMap: Record<string, string>) => {
      setMapping(newMap);
      saveButtonMapping(newMap);
  };

  const getMappingKey = (btnId: string) => `${device.id}_${btnId}`;

  const handleButtonPress = async (btnId: string, defaultAction: () => void) => {
      if (isEditMode) {
          setEditingButtonId(btnId);
          const currentTarget = mapping[getMappingKey(btnId)] || 'none';
          setSelectedTargetId(currentTarget);
          return;
      }

      const mappedTargetId = mapping[getMappingKey(btnId)];
      if (mappedTargetId) {
          const target = allDevices.find(d => d.id === mappedTargetId);
          if (target) {
              const cmd = (target.type === DeviceType.SWITCH || target.type === DeviceType.LIGHT) ? 'on' : 'push';
              await sendHubitatCommand(target.hubitatId, cmd);
              return;
          }
      }
      defaultAction();
  };

  const handleSaveBind = () => {
      if (!editingButtonId) return;
      const newMap = { ...mapping };
      const key = getMappingKey(editingButtonId);
      if (selectedTargetId === 'none') {
          delete newMap[key];
      } else {
          newMap[key] = selectedTargetId;
      }
      saveMapping(newMap);
      setEditingButtonId(null);
  };

  const handleRename = () => {
      if (onRename && newName.trim()) {
          onRename(device.id, newName.trim());
          setShowRename(false);
      }
  };

  const handleMove = () => {
      if (onAssignAction) {
          onAssignAction(device.id, selectedRoomId);
          setShowMove(false);
      }
  };

  const RemoteBtn: React.FC<{ id: string; children?: React.ReactNode; onClick: () => void; className?: string; title?: string }> = ({ id, children, onClick, className = "", title }) => {
      const isBound = !!mapping[getMappingKey(id)];
      return (
          <button 
            onClick={() => handleButtonPress(id, onClick)}
            title={title}
            className={`
                transition-all duration-200 relative
                ${isEditMode ? 'ring-2 ring-yellow-500/50 hover:bg-yellow-500/10 cursor-alias' : ''}
                ${isBound && !isEditMode ? 'after:content-[""] after:absolute after:top-1 after:right-1 after:w-1.5 after:h-1.5 after:bg-blue-400 after:rounded-full after:shadow-[0_0_5px_rgba(59,130,246,0.8)]' : ''}
                ${className}
            `}
          >
              {children}
          </button>
      );
  };

  const sendCommand = async (command: string, args: (string|number)[] = []) => {
      await sendHubitatCommand(device.hubitatId, command, args.length > 0 ? args : undefined);
  };

  // Playback controls
  const isPlaying = device.state.status === 'playing';
  const isPaused = device.state.status === 'paused';

  const handlePlayPause = () => {
      if (isPlaying) {
          onUpdate(device.id, { status: 'paused' });
          sendCommand('pause');
      } else {
          onUpdate(device.id, { status: 'playing' });
          sendCommand('play');
      }
  };

  const handleStop = () => {
      onUpdate(device.id, { status: 'stopped' });
      sendCommand('stop');
  };

  // Volume control
  const handleVolumeChange = (newVol: number) => {
      const clamped = Math.max(0, Math.min(100, newVol));
      setVolume(clamped);
      onUpdate(device.id, { level: clamped });
      sendCommand('setVolume', [clamped]);
  };

  const handleVolumeSlider = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!volumeRef.current) return;
      const rect = volumeRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      handleVolumeChange(Math.round(percent));
  };

  const handleMute = () => {
      const isMuted = device.state.mute === 'muted';
      onUpdate(device.id, { mute: isMuted ? 'unmuted' : 'muted' });
      sendCommand(isMuted ? 'unmute' : 'mute');
  };

  // Input selection
  const handleInput = (command: string) => {
      sendCommand(command);
  };

  // Presets
  const handlePreset = (num: number) => {
      sendCommand(`preset${num}`);
  };

  // Cover art
  const coverUrl = device.state.URLLargeCoverFile || device.state.coverUrl;
  const trackInfo = device.state.trackDescription || device.state.trackData;

  return (
    <GlassCard className={`w-full max-w-sm mx-auto p-5 flex flex-col gap-4 bg-black/40 border-white/10 relative transition-all ${isEditMode ? 'border-yellow-500/30 bg-yellow-900/10' : ''}`}>
        
        {/* Bind Modal */}
        {editingButtonId && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 rounded-2xl animate-in fade-in zoom-in-95">
                <div className="w-full max-w-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-sm font-bold uppercase tracking-widest text-white">Vincular Botão</span>
                        <button onClick={() => setEditingButtonId(null)}><X size={18} className="text-white/50 hover:text-white" /></button>
                    </div>
                    <p className="text-[10px] text-white/60">
                        Botão: <span className="text-yellow-400 font-mono">{editingButtonId}</span>
                    </p>
                    <select 
                        value={selectedTargetId}
                        onChange={(e) => setSelectedTargetId(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-xs text-white"
                    >
                        <option value="none">-- Padrão --</option>
                        {allDevices
                            .filter(d => d.type === DeviceType.SWITCH || d.type === DeviceType.LIGHT || d.type === DeviceType.SCENE)
                            .map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleSaveBind}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg text-xs uppercase"
                    >
                        <Save size={14} className="inline mr-2" /> Salvar
                    </button>
                </div>
            </div>
        )}

        {/* Rename Modal */}
        {showRename && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 rounded-2xl">
                <div className="w-full max-w-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-sm font-bold uppercase text-white">Renomear</span>
                        <button onClick={() => setShowRename(false)}><X size={18} className="text-white/50" /></button>
                    </div>
                    <input 
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-xs text-white"
                        autoFocus
                    />
                    <button onClick={handleRename} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg text-xs">
                        <Save size={14} className="inline mr-2" /> Salvar
                    </button>
                </div>
            </div>
        )}

        {/* Move Modal */}
        {showMove && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 rounded-2xl">
                <div className="w-full max-w-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-sm font-bold uppercase text-white">Mover para</span>
                        <button onClick={() => setShowMove(false)}><X size={18} className="text-white/50" /></button>
                    </div>
                    <select 
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-xs text-white"
                    >
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <button onClick={handleMove} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg text-xs">
                        <ArrowRightLeft size={14} className="inline mr-2" /> Mover
                    </button>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div className="flex items-center gap-3">
                <Speaker size={24} className="text-green-400" />
                <div>
                    <h2 className="text-lg font-medium">{device.name}</h2>
                    <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-widest">
                        <span className={isPlaying ? 'text-green-400' : isPaused ? 'text-yellow-400' : 'text-white/30'}>
                            {isPlaying ? '▶ Tocando' : isPaused ? '⏸ Pausado' : '⏹ Parado'}
                        </span>
                        {device.state.currentInput && <span>• {device.state.currentInput}</span>}
                    </div>
                </div>
            </div>
            <div className="relative">
                <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-2 rounded-full transition-all ${isEditMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-white/30 hover:text-white'}`}
                >
                    <Settings size={18} />
                </button>
                {showMenu && (
                    <div ref={menuRef} className="absolute top-10 right-0 w-40 bg-black/90 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                        <button onClick={() => { setShowMenu(false); setIsEditMode(!isEditMode); }} className="w-full text-left px-3 py-2 text-[10px] hover:bg-white/10 flex items-center gap-2">
                            <Link size={12} /> {isEditMode ? 'Sair Mapeamento' : 'Mapear Botões'}
                        </button>
                        <button onClick={() => { setShowMenu(false); setShowRename(true); }} className="w-full text-left px-3 py-2 text-[10px] hover:bg-white/10 flex items-center gap-2">
                            <PenLine size={12} /> Renomear
                        </button>
                        <button onClick={() => { setShowMenu(false); onDuplicate?.(device); }} className="w-full text-left px-3 py-2 text-[10px] hover:bg-white/10 flex items-center gap-2">
                            <Copy size={12} /> Duplicar
                        </button>
                        <button onClick={() => { setShowMenu(false); setShowMove(true); }} className="w-full text-left px-3 py-2 text-[10px] hover:bg-white/10 flex items-center gap-2">
                            <ArrowRightLeft size={12} /> Mover
                        </button>
                        {onDelete && (
                            <button onClick={() => { setShowMenu(false); onDelete(device.id); }} className="w-full text-left px-3 py-2 text-[10px] text-red-400 hover:bg-white/10 flex items-center gap-2">
                                <Trash2 size={12} /> Excluir
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Album Cover */}
        <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
            {coverUrl ? (
                <img 
                    src={coverUrl} 
                    alt="Album Cover" 
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Music2 size={64} className="text-white/20" />
                </div>
            )}
            {/* Playing indicator overlay */}
            {isPlaying && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
                    <div className="flex items-end gap-0.5 h-3">
                        <div className="w-0.5 bg-green-400 animate-pulse" style={{height: '40%', animationDelay: '0ms'}}></div>
                        <div className="w-0.5 bg-green-400 animate-pulse" style={{height: '80%', animationDelay: '150ms'}}></div>
                        <div className="w-0.5 bg-green-400 animate-pulse" style={{height: '60%', animationDelay: '300ms'}}></div>
                        <div className="w-0.5 bg-green-400 animate-pulse" style={{height: '100%', animationDelay: '450ms'}}></div>
                    </div>
                </div>
            )}
        </div>

        {/* Track Info (if available) */}
        {trackInfo && (
            <div className="text-center text-xs text-white/60 truncate px-2" dangerouslySetInnerHTML={{ __html: trackInfo }} />
        )}

        {/* Playback Controls */}
        <div className="flex justify-center items-center gap-4 py-2">
            <RemoteBtn id="PREV" onClick={() => sendCommand('previousTrack')} className="p-3 text-white/50 hover:text-white rounded-full hover:bg-white/10" title="Anterior">
                <SkipBack size={24} />
            </RemoteBtn>
            <RemoteBtn 
                id="PLAY_PAUSE"
                onClick={handlePlayPause} 
                className={`p-4 rounded-full transition-all ${isPlaying ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-white/10 text-white hover:bg-white/20'}`}
                title={isPlaying ? 'Pausar' : 'Tocar'}
            >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </RemoteBtn>
            <RemoteBtn id="STOP" onClick={handleStop} className="p-3 text-white/50 hover:text-white rounded-full hover:bg-white/10" title="Parar">
                <Square size={20} fill="currentColor" />
            </RemoteBtn>
            <RemoteBtn id="NEXT" onClick={() => sendCommand('nextTrack')} className="p-3 text-white/50 hover:text-white rounded-full hover:bg-white/10" title="Próxima">
                <SkipForward size={24} />
            </RemoteBtn>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-white/50 uppercase">
                <span>Volume</span>
                <span className="font-mono">{volume}%</span>
            </div>
            <div className="flex items-center gap-3">
                <RemoteBtn id="MUTE" onClick={handleMute} className={`p-2 rounded-lg ${device.state.mute === 'muted' ? 'bg-red-500/20 text-red-400' : 'text-white/50 hover:text-white'}`}>
                    {device.state.mute === 'muted' ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </RemoteBtn>
                <div 
                    ref={volumeRef}
                    className="flex-1 h-2 bg-white/10 rounded-full cursor-pointer relative"
                    onClick={handleVolumeSlider}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                >
                    <div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                        style={{ width: `${volume}%` }}
                    />
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all"
                        style={{ left: `calc(${volume}% - 8px)` }}
                    />
                </div>
                <RemoteBtn id="VOL_DOWN" onClick={() => handleVolumeChange(volume - 5)} className="p-2 text-white/50 hover:text-white">
                    <Minus size={16} />
                </RemoteBtn>
                <RemoteBtn id="VOL_UP" onClick={() => handleVolumeChange(volume + 5)} className="p-2 text-white/50 hover:text-white">
                    <Plus size={16} />
                </RemoteBtn>
            </div>
        </div>

        {/* Input Selection */}
        <div className="space-y-2">
            <div className="text-[10px] text-white/50 uppercase">Entrada</div>
            <div className="grid grid-cols-6 gap-1">
                {INPUTS.map(input => {
                    const Icon = input.icon;
                    const isActive = device.state.currentInput?.toLowerCase().includes(input.name.toLowerCase());
                    return (
                        <RemoteBtn 
                            key={input.command}
                            id={`INPUT_${input.command}`}
                            onClick={() => handleInput(input.command)}
                            className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                                isActive 
                                ? 'bg-white/20 border border-white/30' 
                                : 'bg-white/5 hover:bg-white/10 border border-transparent'
                            }`}
                            title={input.name}
                        >
                            <Icon size={16} className={isActive ? input.color : 'text-white/50'} />
                            <span className="text-[8px] text-white/50">{input.name}</span>
                        </RemoteBtn>
                    );
                })}
            </div>
        </div>

        {/* Presets */}
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase">
                <Radio size={12} />
                <span>Presets</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <RemoteBtn 
                        key={num}
                        id={`PRESET_${num}`}
                        onClick={() => handlePreset(num)}
                        className="py-2 bg-white/5 hover:bg-white/15 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-all border border-white/5 hover:border-white/20"
                    >
                        {num}
                    </RemoteBtn>
                ))}
            </div>
        </div>

    </GlassCard>
  );
};
