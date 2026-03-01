
import React, { useState, useEffect, useRef } from 'react';
import { Device, DeviceType, Room } from '../types';
import { GlassCard } from './GlassCard';
import { sendHubitatCommand, getButtonMapping, saveButtonMapping } from '../services/hubitatService';
import { 
    Power, Plus, Minus, Thermometer, 
    Snowflake, Sun, Droplets, Gauge, Fan, 
    RefreshCw, Zap, Lightbulb, Clock, Settings, Save, X, Copy, PenLine, ArrowRightLeft, Link, Trash2
} from 'lucide-react';

interface ACRemoteProps {
  device: Device;
  onUpdate: (id: string, newState: Partial<Device['state']>) => void;
  onBeforeCommand?: () => void;
  allDevices: Device[]; 
  rooms?: Room[];
  onDuplicate?: (device: Device) => void;
  onRename?: (id: string, name: string) => void;
  onAssignAction?: (id: string, roomId: string) => void; // Using this for Move Room
  onDelete?: (id: string) => void;
}

const MODES = [
    { label: 'Cool', value: 'cool', icon: Snowflake, color: 'text-cyan-400', cmd: 'cool', id: 'MODE_COOL' },
    { label: 'Heat', value: 'heat', icon: Sun, color: 'text-orange-400', cmd: 'heat', id: 'MODE_HEAT' },
    { label: 'Auto', value: 'auto', icon: Gauge, color: 'text-green-400', cmd: 'auto', id: 'MODE_AUTO' },
    { label: 'Dry', value: 'dry', icon: Droplets, color: 'text-blue-300', cmd: 'dry', id: 'MODE_DRY' },
    { label: 'Fan', value: 'fan', icon: Fan, color: 'text-white/70', cmd: 'fan', id: 'MODE_FAN' },
];

const FANS = [
    { label: 'Auto', value: 'auto', cmd: 'fanAuto', id: 'FAN_AUTO' },
    { label: 'Low', value: 'low', cmd: 'fanLow', id: 'FAN_LOW' },
    { label: 'Mid', value: 'mid', cmd: 'fanMed', id: 'FAN_MID' }, 
    { label: 'High', value: 'high', cmd: 'fanHigh', id: 'FAN_HIGH' },
];

export const ACRemote: React.FC<ACRemoteProps> = ({ device, onUpdate, allDevices, rooms = [], onDuplicate, onRename, onAssignAction, onDelete }) => {
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

  // --- Logic to Intercept Clicks for Binding ---
  const handleButtonPress = async (btnId: string, defaultAction: () => void) => {
      if (isEditMode) {
          setEditingButtonId(btnId);
          const currentTarget = mapping[getMappingKey(btnId)] || 'none';
          setSelectedTargetId(currentTarget);
          return;
      }

      const mappedTargetId = mapping[getMappingKey(btnId)];
      if (mappedTargetId) {
          // Find the target device
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

  // --- Wrapper Component ---
  const RemoteBtn: React.FC<{ id: string; children?: React.ReactNode; onClick: () => void; className?: string }> = ({ id, children, onClick, className = "" }) => {
      const isBound = !!mapping[getMappingKey(id)];
      const hasAbsolute = className.includes('absolute');

      return (
          <button 
            onClick={() => handleButtonPress(id, onClick)}
            className={`
                transition-all duration-200
                ${hasAbsolute ? '' : 'relative'}
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
      await sendHubitatCommand({
          deviceId: device.hubitatId,
          command: command,
          arguments: args
      });
  };

  const handlePower = async () => {
      const newState = !device.state.isOn;
      onUpdate(device.id, { isOn: newState });
      await sendCommand(newState ? 'poweron' : 'poweroff');
  };

  const handleMode = async (mode: any) => {
      onUpdate(device.id, { mode: mode.value, isOn: true });
      await sendCommand(mode.cmd);
  };

  const handleFan = async (fan: any) => {
      onUpdate(device.id, { fanMode: fan.value });
      await sendCommand(fan.cmd);
  };

  const handleTempChange = async (direction: 'up' | 'down') => {
      // Optimistic update
      const current = device.state.setpoint || 22;
      const next = direction === 'up' ? Math.min(30, current + 1) : Math.max(17, current - 1);
      
      onUpdate(device.id, { setpoint: next });
      
      if (device.state.mode === 'heat') {
          await sendCommand('setHeatingSetpoint', [next]);
      } else {
          await sendCommand('setCoolingSetpoint', [next]);
      }
  };

  const handleExtra = async (cmd: string) => {
      await sendCommand(cmd);
  };

  return (
    <GlassCard className={`w-full max-w-sm mx-auto p-6 flex flex-col gap-6 bg-black/40 border-white/10 overflow-visible relative transition-all ${isEditMode ? 'border-yellow-500/30 bg-yellow-900/10' : ''}`}>
        
        {/* Bind Modal */}
        {editingButtonId && (
            <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 rounded-2xl animate-in fade-in zoom-in-95 text-left">
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
                            <option value="none">-- Padrão (Comando do AC) --</option>
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

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="flex flex-col">
                <h2 className="text-xl font-medium">{device.name}</h2>
                <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-widest">
                    <span className={device.state.isOn ? 'text-green-400' : 'text-red-400'}>
                        {device.state.isOn ? 'Ligado' : 'Off'}
                    </span>
                    {device.state.isOn && (
                        <>
                            <span>• {device.state.mode}</span>
                            <span>• Fan: {device.state.fanMode || 'Auto'}</span>
                        </>
                    )}
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
                            className="w-full text-left px-4 py-3 text-[10px] text-white hover:bg-white/10 flex items-center gap-2 border-b border-white/5"
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
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                        : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                    }`}
                >
                    <Power size={24} />
                </RemoteBtn>
            </div>
        </div>

        {/* Temperature Display & Control */}
        <div className="flex items-center justify-center py-4 relative">
            <RemoteBtn id="TEMP_DOWN" onClick={() => handleTempChange('down')} className="p-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 active:scale-95 transition-all">
                <Minus size={24} className="text-white/70" />
            </RemoteBtn>
            
            <div className="flex flex-col items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-2xl mx-4 relative backdrop-blur-md">
                <span className="text-5xl font-light tracking-tighter text-white drop-shadow-md">
                    {device.state.setpoint}°
                </span>
                <span className="text-[10px] uppercase text-white/40 mt-1 flex items-center gap-1">
                    <Thermometer size={10} /> Atual: {device.state.temperature}°
                </span>
            </div>

            <RemoteBtn id="TEMP_UP" onClick={() => handleTempChange('up')} className="p-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 active:scale-95 transition-all">
                <Plus size={24} className="text-white/70" />
            </RemoteBtn>
        </div>

        {/* Modes */}
        <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Modo</h3>
            <div className="grid grid-cols-5 gap-2">
                {MODES.map(mode => {
                    const Icon = mode.icon;
                    const active = device.state.mode === mode.value;
                    return (
                        <RemoteBtn
                            id={mode.id}
                            key={mode.value}
                            onClick={() => handleMode(mode)}
                            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-200 ${
                                active 
                                ? `bg-white/10 border-white/30 text-white shadow-lg ${mode.color.replace('text', 'shadow')}/20` 
                                : 'bg-transparent border-transparent text-white/30 hover:bg-white/5 hover:text-white/70'
                            }`}
                        >
                            <Icon size={20} className={active ? mode.color : 'text-current'} />
                            <span className="text-[9px] font-medium">{mode.label}</span>
                        </RemoteBtn>
                    )
                })}
            </div>
        </div>

        {/* Fan Speed */}
        <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">Ventilação</h3>
            <div className="grid grid-cols-4 gap-2">
                {FANS.map(fan => {
                    const active = (device.state.fanMode || 'auto').toLowerCase().includes(fan.value);
                    return (
                        <RemoteBtn
                            id={fan.id}
                            key={fan.value}
                            onClick={() => handleFan(fan)}
                            className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                active
                                ? 'bg-blue-500/20 border-blue-500/40 text-blue-200'
                                : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {fan.label}
                        </RemoteBtn>
                    )
                })}
            </div>
        </div>

        {/* Extras */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
            <RemoteBtn id="EXT_SWING" onClick={() => handleExtra('swing')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                <RefreshCw size={18} /> <span className="text-[9px]">Swing</span>
            </RemoteBtn>
            <RemoteBtn id="EXT_TURBO" onClick={() => handleExtra('turbo')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                <Zap size={18} /> <span className="text-[9px]">Turbo</span>
            </RemoteBtn>
            <RemoteBtn id="EXT_DISPLAY" onClick={() => handleExtra('display')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                <Lightbulb size={18} /> <span className="text-[9px]">Display</span>
            </RemoteBtn>
            <RemoteBtn id="EXT_TIMER" onClick={() => handleExtra('timer')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors">
                <Clock size={18} /> <span className="text-[9px]">Timer</span>
            </RemoteBtn>
        </div>

    </GlassCard>
  );
};
