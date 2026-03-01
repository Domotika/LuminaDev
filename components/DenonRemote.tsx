
import React, { useState, useEffect, useRef } from 'react';
import { Device, DeviceType, Room } from '../types';
import { GlassCard } from './GlassCard';
import { sendHubitatCommand, getButtonMapping, saveButtonMapping } from '../services/hubitatService';
import { Power, Volume2, VolumeX, Tv, Disc, Radio, Gamepad2, Wifi, Cable, Music, Film, Headphones, Settings, X, Save, Copy, PenLine, ArrowRightLeft, Link, Trash2 } from 'lucide-react';

interface DenonRemoteProps {
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

// Maps based on the Groovy Driver 'command_input' names
const INPUTS = [
    { label: 'CBL/SAT', icon: Cable, value: 'Satellite/Cable', id: 'INP_CBL' },
    { label: 'DVD', icon: Disc, value: 'DVD', id: 'INP_DVD' },
    { label: 'BluRay', icon: Disc, value: 'BlueRay', id: 'INP_BD' },
    { label: 'TV', icon: Tv, value: 'TV', id: 'INP_TV' },
    { label: 'Game', icon: Gamepad2, value: 'Game', id: 'INP_GAME' },
    { label: 'Media', icon: Film, value: 'Media Player', id: 'INP_MEDIA' },
    { label: 'Net', icon: Wifi, value: 'Network', id: 'INP_NET' },
    { label: 'Tuner', icon: Radio, value: 'Tuner', id: 'INP_TUNER' },
    { label: 'Aux', icon: Headphones, value: 'Auxilary', id: 'INP_AUX' }
];

// Maps based on the Groovy Driver 'command_mode' names
const MODES = [
    { label: 'Stereo', value: 'Stereo', id: 'MODE_STEREO' },
    { label: 'Dolby', value: 'Dolby Digital', id: 'MODE_DOLBY' },
    { label: 'DTS', value: 'DTS Surround Sound', id: 'MODE_DTS' },
    { label: 'M.Ch Stereo', value: 'Multi-Channel Stereo', id: 'MODE_MCH' },
    { label: 'Movie', value: 'Movie', id: 'MODE_MOVIE' },
    { label: 'Music', value: 'Music', id: 'MODE_MUSIC' },
    { label: 'Game', value: 'Game', id: 'MODE_GAME' },
    { label: 'Direct', value: 'Direct', id: 'MODE_DIRECT' },
    { label: 'Pure Direct', value: 'Pure Direct', id: 'MODE_PURE' }
];

export const DenonRemote: React.FC<DenonRemoteProps> = ({ device, onUpdate, allDevices, rooms = [], onDuplicate, onRename, onAssignAction, onDelete }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [editingButtonId, setEditingButtonId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('none');

  // Menu States
  const [showMenu, setShowMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [newName, setNewName] = useState(device.name);
  const [selectedRoomId, setSelectedRoomId] = useState(device.roomId);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      setMapping(getButtonMapping());
  }, []);

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

  const handleButtonPress = async (btnId: string, defaultAction: (e?: any) => void) => {
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
              await sendHubitatCommand({
                  deviceId: target.hubitatId,
                  command: cmd
              });
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

  // --- Menu Handlers ---
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

  const RemoteBtn: React.FC<{ id: string; children?: React.ReactNode; onClick: () => void; className?: string }> = ({ id, children, onClick, className = "" }) => {
      const isBound = !!mapping[getMappingKey(id)];
      return (
          <button 
            onClick={() => handleButtonPress(id, onClick)}
            className={`
                relative transition-all duration-200
                ${isEditMode ? 'ring-2 ring-yellow-500/50 hover:bg-yellow-500/10 cursor-alias' : ''}
                ${isBound && !isEditMode ? 'after:content-[""] after:absolute after:top-1 after:right-1 after:w-1.5 after:h-1.5 after:bg-blue-400 after:rounded-full after:shadow-[0_0_5px_rgba(59,130,246,0.8)]' : ''}
                ${className}
            `}
          >
              {children}
          </button>
      );
  };
  
  const handlePower = async () => {
      const newState = !device.state.isOn;
      onUpdate(device.id, { isOn: newState });
      await sendHubitatCommand({
          deviceId: device.hubitatId,
          command: newState ? 'on' : 'off'
      });
  };

  const handleMute = async () => {
      const newState = !device.state.mute;
      onUpdate(device.id, { mute: newState });
      await sendHubitatCommand({
          deviceId: device.hubitatId,
          command: newState ? 'mute' : 'unmute'
      });
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const vol = parseInt(e.target.value);
      onUpdate(device.id, { level: vol });
      await sendHubitatCommand({
          deviceId: device.hubitatId,
          command: 'setLevel',
          arguments: [vol]
      });
  };

  const handleInputSelect = async (inputValue: string) => {
      onUpdate(device.id, { input: inputValue });
      await sendHubitatCommand({
          deviceId: device.hubitatId,
          command: 'SetInput',
          arguments: [inputValue]
      });
  };

  const handleModeSelect = async (modeValue: string) => {
      onUpdate(device.id, { audioMode: modeValue });
      await sendHubitatCommand({
          deviceId: device.hubitatId,
          command: 'SetAudioMode',
          arguments: [modeValue]
      });
  };

  return (
    <GlassCard className={`w-full p-6 flex flex-col gap-6 relative overflow-hidden bg-black/40 transition-all ${isEditMode ? 'border-yellow-500/30 bg-yellow-900/10' : ''}`}>
        
        {/* Bind Modal */}
        {editingButtonId && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 rounded-2xl animate-in fade-in zoom-in-95">
                <div className="w-full max-w-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-sm font-bold uppercase tracking-widest text-white">Vincular Botão</span>
                        <button onClick={() => setEditingButtonId(null)}><X size={18} className="text-white/50 hover:text-white" /></button>
                    </div>
                    <p className="text-[10px] text-white/60">
                        Botão selecionado: <span className="text-yellow-400 font-mono">{editingButtonId}</span>
                    </p>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-white/40 font-bold">Ação ao clicar</label>
                        <select 
                            value={selectedTargetId}
                            onChange={(e) => setSelectedTargetId(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-yellow-500"
                        >
                            <option value="none">-- Padrão (Função do Receiver) --</option>
                            {allDevices
                                .filter(d => d.type === DeviceType.SWITCH || d.type === DeviceType.LIGHT || d.type === DeviceType.SCENE || d.type === DeviceType.LOCK)
                                .sort((a,b) => a.name.localeCompare(b.name))
                                .map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        onClick={handleSaveBind}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                        <Save size={14} /> Salvar Vínculo
                    </button>
                </div>
            </div>
        )}

        {/* Rename Modal */}
        {showRename && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 rounded-2xl animate-in fade-in zoom-in-95 text-left">
                <div className="w-full max-w-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-sm font-bold uppercase tracking-widest text-white">Renomear</span>
                        <button onClick={() => setShowRename(false)}><X size={18} className="text-white/50 hover:text-white" /></button>
                    </div>
                    <input 
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        autoFocus
                    />
                    <button 
                        onClick={handleRename}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                        <Save size={14} /> Salvar
                    </button>
                </div>
            </div>
        )}

        {/* Move Room Modal */}
        {showMove && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 rounded-2xl animate-in fade-in zoom-in-95 text-left">
                <div className="w-full max-w-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-sm font-bold uppercase tracking-widest text-white">Mover para</span>
                        <button onClick={() => setShowMove(false)}><X size={18} className="text-white/50 hover:text-white" /></button>
                    </div>
                    <select 
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                        {rooms.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleMove}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                        <ArrowRightLeft size={14} /> Mover
                    </button>
                </div>
            </div>
        )}

        {/* Header: Name & Power */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex flex-col">
                <h2 className="text-xl font-medium tracking-wide">{device.name}</h2>
                <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-widest">
                    <span className={device.state.isOn ? 'text-green-400' : 'text-red-400'}>
                        {device.state.isOn ? 'Ligado' : 'Standby'}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">{device.state.input || 'Unknown Input'}</span>
                </div>
            </div>
            <div className="flex gap-3 relative">
                <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-3 rounded-full transition-all duration-300 ${
                        isEditMode
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' 
                        : 'bg-white/5 text-white/30 hover:text-white border border-transparent hover:bg-white/10'
                    }`}
                    title="Ajustes"
                >
                    <Settings size={20} />
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                    <div ref={menuRef} className="absolute top-12 right-0 w-44 bg-black/90 border border-white/10 backdrop-blur-xl rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => { setShowMenu(false); setIsEditMode(!isEditMode); }}
                            className={`w-full text-left px-4 py-3 text-[10px] flex items-center gap-2 border-b border-white/5 hover:bg-white/10 ${isEditMode ? 'text-yellow-400' : 'text-white'}`}
                        >
                            <Link size={14} className={isEditMode ? 'text-yellow-400' : 'text-white/60'} />
                            {isEditMode ? 'Sair do Mapeamento' : 'Mapear Botões'}
                        </button>
                        <button 
                            onClick={() => { setShowMenu(false); setShowRename(true); }}
                            className="w-full text-left px-4 py-3 text-[10px] text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/5"
                        >
                            <PenLine size={14} className="text-blue-400" />
                            Renomear
                        </button>
                        <button 
                            onClick={() => { setShowMenu(false); onDuplicate && onDuplicate(device); }}
                            className="w-full text-left px-4 py-3 text-[10px] text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/5"
                        >
                            <Copy size={14} className="text-green-400" />
                            Duplicar
                        </button>
                        <button 
                            onClick={() => { setShowMenu(false); setShowMove(true); }}
                            className="w-full text-left px-4 py-3 text-[10px] text-white hover:bg-white/10 flex items-center gap-2"
                        >
                            <ArrowRightLeft size={14} className="text-purple-400" />
                            Mover para...
                        </button>
                        {onDelete && (
                            <button 
                                onClick={() => { setShowMenu(false); onDelete(device.id); }}
                                className="w-full text-left px-4 py-3 text-[10px] text-red-400 hover:bg-white/10 flex items-center gap-2"
                            >
                                <Trash2 size={14} />
                                Excluir
                            </button>
                        )}
                    </div>
                )}

                <RemoteBtn 
                    id="POWER"
                    onClick={handlePower}
                    className={`p-3 rounded-full transition-all duration-300 ${
                        device.state.isOn 
                        ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                        : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                    }`}
                >
                    <Power size={24} />
                </RemoteBtn>
            </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <RemoteBtn 
                id="MUTE"
                onClick={handleMute}
                className={`p-2 rounded-lg transition-colors ${device.state.mute ? 'text-red-400 bg-red-500/10' : 'text-white/70 hover:text-white'}`}
            >
                {device.state.mute ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </RemoteBtn>
            <div className="flex-1 flex flex-col gap-1">
                {/* Sliders are tricky to intercept with click, so we wrap the container but it works best for buttons. 
                    We'll skip binding the slider itself for now as it's complex, or bind the whole slider interaction to a single action? 
                    Better to just bind Mute/Power/Inputs/Modes for now. */}
                <input 
                    type="range" 
                    min="0" 
                    max="98" 
                    value={device.state.level || 0}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
            </div>
            <span className="text-sm font-bold w-10 text-right">{device.state.level || 0}</span>
        </div>

        {/* Inputs Grid */}
        <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Entradas</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {INPUTS.map((inp) => {
                    const isActive = device.state.input === inp.value;
                    const Icon = inp.icon;
                    return (
                        <RemoteBtn
                            id={inp.id}
                            key={inp.value}
                            onClick={() => handleInputSelect(inp.value)}
                            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg border transition-all duration-200 ${
                                isActive 
                                ? 'bg-blue-600/30 border-blue-500/50 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]' 
                                : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Icon size={18} />
                            <span className="text-[9px] font-medium tracking-wide">{inp.label}</span>
                        </RemoteBtn>
                    )
                })}
            </div>
        </div>

        {/* Sound Modes */}
        <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Modo de Som</h3>
            <div className="flex flex-wrap gap-2">
                {MODES.map((mode) => {
                     const isActive = device.state.audioMode === mode.value;
                     return (
                        <RemoteBtn
                            id={mode.id}
                            key={mode.value}
                            onClick={() => handleModeSelect(mode.value)}
                            className={`px-3 py-1.5 rounded text-[10px] font-medium transition-all border ${
                                isActive
                                ? 'bg-purple-600/30 border-purple-500/50 text-white'
                                : 'bg-black/20 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {mode.label}
                        </RemoteBtn>
                     )
                })}
            </div>
        </div>
    </GlassCard>
  );
};
