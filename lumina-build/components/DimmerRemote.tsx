import React, { useState, useEffect, useRef } from 'react';
import { Device, DeviceType, Room } from '../types';
import { GlassCard } from './GlassCard';
import { sendHubitatCommand, getButtonMapping, saveButtonMapping } from '../services/hubitatService';
import { 
    Power, Sun, Moon, Lightbulb, Settings, Link, X, Save, Copy, 
    PenLine, ArrowRightLeft, Trash2, Minus, Plus
} from 'lucide-react';

/**
 * DimmerRemote - Card visual para Dimmers (MolSmart 0-10V, Generic Dimmer, etc)
 * 
 * Features:
 * - Slider grande com feedback visual
 * - Botões de preset (25%, 50%, 75%, 100%)
 * - On/Off com indicador visual
 * - Cor do glow muda conforme intensidade
 */

interface DimmerRemoteProps {
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

const PRESETS = [
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: '75%', value: 75 },
    { label: '100%', value: 100 },
];

export const DimmerRemote: React.FC<DimmerRemoteProps> = ({ 
    device, 
    onUpdate, 
    allDevices, 
    rooms = [], 
    onDuplicate, 
    onRename, 
    onAssignAction, 
    onDelete,
    onBeforeCommand 
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [editingButtonId, setEditingButtonId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('none');
  const [localLevel, setLocalLevel] = useState(device.state.level || 0);
  const [isDragging, setIsDragging] = useState(false);

  // Menu States
  const [showMenu, setShowMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [newName, setNewName] = useState(device.name);
  const [selectedRoomId, setSelectedRoomId] = useState(device.roomId);
  const menuRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      setMapping(getButtonMapping());
  }, []);

  // Sync local level with device state when not dragging
  useEffect(() => {
      if (!isDragging) {
          setLocalLevel(device.state.level || 0);
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

  const sendCommand = async (command: string, args?: (string|number)[]) => {
      onBeforeCommand?.();
      await sendHubitatCommand(device.hubitatId, command, args);
  };

  // Power control
  const isOn = device.state.isOn || (localLevel > 0);

  const handlePower = () => {
      const newState = !isOn;
      onUpdate(device.id, { isOn: newState, level: newState ? (localLevel || 100) : 0 });
      sendCommand(newState ? 'on' : 'off');
      if (newState && localLevel === 0) setLocalLevel(100);
      if (!newState) setLocalLevel(0);
  };

  // Level control
  const handleSetLevel = (level: number) => {
      const clamped = Math.max(0, Math.min(100, level));
      setLocalLevel(clamped);
      onUpdate(device.id, { level: clamped, isOn: clamped > 0 });
      sendCommand('setLevel', [clamped]);
  };

  // Slider interaction
  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      // Vertical slider - calculate from bottom
      const percent = Math.max(0, Math.min(100, ((rect.bottom - e.clientY) / rect.height) * 100));
      handleSetLevel(Math.round(percent));
  };

  const handleSliderDrag = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((rect.bottom - e.clientY) / rect.height) * 100));
      setLocalLevel(Math.round(percent));
  };

  const handleSliderRelease = () => {
      if (isDragging) {
          setIsDragging(false);
          handleSetLevel(localLevel);
      }
  };

  // Color based on level
  const getGlowColor = () => {
      if (localLevel === 0) return 'rgba(255,255,255,0.1)';
      if (localLevel < 30) return 'rgba(255,180,100,0.3)';
      if (localLevel < 60) return 'rgba(255,200,120,0.5)';
      if (localLevel < 90) return 'rgba(255,220,150,0.7)';
      return 'rgba(255,240,200,0.9)';
  };

  const getBulbColor = () => {
      if (localLevel === 0) return 'text-white/30';
      if (localLevel < 30) return 'text-orange-300';
      if (localLevel < 60) return 'text-yellow-300';
      if (localLevel < 90) return 'text-yellow-200';
      return 'text-yellow-100';
  };

  return (
    <GlassCard className={`w-full max-w-xs mx-auto p-5 flex flex-col gap-4 bg-black/40 border-white/10 relative transition-all ${isEditMode ? 'border-yellow-500/30 bg-yellow-900/10' : ''}`}>
        
        {/* Bind Modal */}
        {editingButtonId && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 rounded-2xl animate-in fade-in zoom-in-95">
                <div className="w-full max-w-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-sm font-bold uppercase tracking-widest text-white">Vincular Botão</span>
                        <button onClick={() => setEditingButtonId(null)}><X size={18} className="text-white/50 hover:text-white" /></button>
                    </div>
                    <p className="text-[10px] text-white/60">Botão: <span className="text-yellow-400 font-mono">{editingButtonId}</span></p>
                    <select 
                        value={selectedTargetId}
                        onChange={(e) => setSelectedTargetId(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-xs text-white"
                    >
                        <option value="none">-- Padrão --</option>
                        {allDevices
                            .filter(d => d.type === DeviceType.SWITCH || d.type === DeviceType.LIGHT || d.type === DeviceType.SCENE)
                            .map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                    </select>
                    <button onClick={handleSaveBind} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg text-xs uppercase">
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
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-xs text-white" autoFocus />
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
                    <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-xs text-white">
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <button onClick={handleMove} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg text-xs">
                        <ArrowRightLeft size={14} className="inline mr-2" /> Mover
                    </button>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div 
                    className={`p-2 rounded-full transition-all duration-500 ${getBulbColor()}`}
                    style={{ 
                        boxShadow: isOn ? `0 0 ${20 + localLevel/3}px ${getGlowColor()}` : 'none',
                        background: isOn ? getGlowColor() : 'rgba(255,255,255,0.05)'
                    }}
                >
                    <Lightbulb size={24} />
                </div>
                <div>
                    <h2 className="text-base font-medium">{device.name}</h2>
                    <div className="text-[10px] text-white/50 uppercase tracking-widest">
                        {isOn ? `${localLevel}%` : 'Desligado'}
                    </div>
                </div>
            </div>
            <div className="relative">
                <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-2 rounded-full transition-all ${isEditMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-white/30 hover:text-white'}`}
                >
                    <Settings size={16} />
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

        {/* Main Control Area */}
        <div className="flex gap-4 items-stretch">
            
            {/* Vertical Slider */}
            <div 
                ref={sliderRef}
                className="relative w-16 h-48 bg-white/5 rounded-2xl border border-white/10 cursor-pointer overflow-hidden"
                onClick={handleSliderClick}
                onMouseDown={() => setIsDragging(true)}
                onMouseMove={handleSliderDrag}
                onMouseUp={handleSliderRelease}
                onMouseLeave={handleSliderRelease}
            >
                {/* Fill */}
                <div 
                    className="absolute bottom-0 left-0 right-0 transition-all duration-150 rounded-b-xl"
                    style={{ 
                        height: `${localLevel}%`,
                        background: `linear-gradient(to top, rgba(251,191,36,0.8), rgba(251,191,36,0.3))`,
                        boxShadow: isOn ? `0 0 20px ${getGlowColor()}` : 'none'
                    }}
                />
                {/* Level indicator - clamped to stay inside slider */}
                <div 
                    className="absolute left-1/2 -translate-x-1/2 w-12 h-6 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-150"
                    style={{ bottom: `calc(${Math.min(Math.max(localLevel, 5), 92)}% - 12px)` }}
                >
                    <span className="text-[10px] font-bold text-black">{localLevel}%</span>
                </div>
                {/* Min/Max labels */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                    <Sun size={14} className="text-white/30" />
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <Moon size={14} className="text-white/30" />
                </div>
            </div>

            {/* Right side controls */}
            <div className="flex-1 flex flex-col gap-3">
                
                {/* Power Button */}
                <RemoteBtn 
                    id="POWER"
                    onClick={handlePower}
                    className={`flex-1 rounded-xl flex items-center justify-center transition-all ${
                        isOn 
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
                    }`}
                    title={isOn ? 'Desligar' : 'Ligar'}
                >
                    <Power size={28} />
                </RemoteBtn>

                {/* +/- Buttons */}
                <div className="flex gap-2">
                    <RemoteBtn 
                        id="DIM_DOWN"
                        onClick={() => handleSetLevel(Math.max(0, localLevel - 10))}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 flex items-center justify-center border border-white/10"
                        title="-10%"
                    >
                        <Minus size={18} />
                    </RemoteBtn>
                    <RemoteBtn 
                        id="DIM_UP"
                        onClick={() => handleSetLevel(Math.min(100, localLevel + 10))}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 flex items-center justify-center border border-white/10"
                        title="+10%"
                    >
                        <Plus size={18} />
                    </RemoteBtn>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map(preset => (
                        <RemoteBtn 
                            key={preset.value}
                            id={`PRESET_${preset.value}`}
                            onClick={() => handleSetLevel(preset.value)}
                            className={`py-2 rounded-lg text-xs font-medium transition-all border ${
                                localLevel === preset.value 
                                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border-white/10 hover:text-white'
                            }`}
                        >
                            {preset.label}
                        </RemoteBtn>
                    ))}
                </div>
            </div>
        </div>

    </GlassCard>
  );
};
