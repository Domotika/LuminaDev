
import React, { useState, useEffect, useRef } from 'react';
import { Device, DeviceType, Room } from '../types';
import { GlassCard } from './GlassCard';
import { sendHubitatCommand, getButtonMapping, saveButtonMapping } from '../services/hubitatService';
import { 
    Power, Volume2, VolumeX, Plus, Minus, ChevronUp, ChevronDown, 
    ChevronLeft, ChevronRight, Home, Reply, Menu, Circle, Play, Pause, Square, AppWindow,
    Monitor, Settings, Link, X, Save, Copy, PenLine, ArrowRightLeft, Trash2
} from 'lucide-react';

interface LGRemoteProps {
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

const APPS = [
    { name: 'Netflix', color: 'bg-red-600', id: 'NETFLIX' },
    { name: 'YouTube', color: 'bg-red-500', id: 'YOUTUBE' },
    { name: 'Prime Video', color: 'bg-blue-500', id: 'PRIME' },
    { name: 'Spotify', color: 'bg-green-500', id: 'SPOTIFY' },
    { name: 'HBO Max', color: 'bg-purple-600', id: 'HBO' },
    { name: 'Disney+', color: 'bg-blue-700', id: 'DISNEY' }
];

export const LGRemote: React.FC<LGRemoteProps> = ({ device, onUpdate, allDevices, rooms = [], onDuplicate, onRename, onAssignAction, onDelete }) => {
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

  // Helper to handle clicks: Intercept if bound, or edit if mode active
  const handleButtonPress = async (btnId: string, defaultAction: () => void) => {
      if (isEditMode) {
          setEditingButtonId(btnId);
          const currentTarget = mapping[getMappingKey(btnId)] || 'none';
          setSelectedTargetId(currentTarget);
          return;
      }

      const mappedTargetId = mapping[getMappingKey(btnId)];
      if (mappedTargetId) {
          // Find the target device to get its real Hubitat ID
          const target = allDevices.find(d => d.id === mappedTargetId);
          if (target) {
              // Send 'on' for switches, 'push' for buttons (simplified)
              const cmd = (target.type === DeviceType.SWITCH || target.type === DeviceType.LIGHT) ? 'on' : 'push';
              await sendHubitatCommand({
                  deviceId: target.hubitatId,
                  command: cmd
              });
              return; // Skip default action
          }
      }

      // No mapping or target not found -> Default Action
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

  // --- Wrapper for Buttons to handle Edit Mode Visuals ---
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

  const handlePower = () => {
      const newState = !device.state.isOn;
      onUpdate(device.id, { isOn: newState });
      sendCommand(newState ? 'on' : 'off');
  };

  const pushButton = (button: string) => {
      sendCommand('pushRemoteButtons', [button]);
  };

  const launchApp = (appName: string) => {
      onUpdate(device.id, { currentApp: appName });
      sendCommand('startActivity', [appName]);
  };

  const handleVolume = (direction: 'up' | 'down') => {
      sendCommand(direction === 'up' ? 'volumeUp' : 'volumeDown');
      const current = device.state.level || 0;
      onUpdate(device.id, { level: direction === 'up' ? Math.min(100, current + 1) : Math.max(0, current - 1) });
  };

  const handleChannel = (direction: 'up' | 'down') => {
      sendCommand(direction === 'up' ? 'channelUp' : 'channelDown');
  };

  return (
    <GlassCard className={`w-full max-w-sm mx-auto p-6 flex flex-col gap-6 bg-black/40 border-white/10 relative transition-all ${isEditMode ? 'border-yellow-500/30 bg-yellow-900/10' : ''}`}>
        
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
                            <option value="none">-- Padrão (Função da TV) --</option>
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

        {/* Header: Power & Info */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div className="flex flex-col">
                <h2 className="text-xl font-medium">{device.name}</h2>
                <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-widest">
                    <span className={device.state.isOn ? 'text-green-400' : 'text-red-400'}>
                        {device.state.isOn ? 'Ligado' : 'Off'}
                    </span>
                    {device.state.currentApp && <span>• {device.state.currentApp}</span>}
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
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                        : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                    }`}
                >
                    <Power size={24} />
                </RemoteBtn>
            </div>
        </div>

        {/* Navigation Circle (D-Pad) */}
        <div className="relative w-48 h-48 mx-auto bg-white/5 rounded-full border border-white/5 flex items-center justify-center">
            <RemoteBtn id="UP" onClick={() => pushButton('UP')} className="absolute top-2 left-1/2 -translate-x-1/2 p-3 text-white/70 hover:text-white active:scale-95 rounded-full"><ChevronUp size={24} /></RemoteBtn>
            <RemoteBtn id="DOWN" onClick={() => pushButton('DOWN')} className="absolute bottom-2 left-1/2 -translate-x-1/2 p-3 text-white/70 hover:text-white active:scale-95 rounded-full"><ChevronDown size={24} /></RemoteBtn>
            <RemoteBtn id="LEFT" onClick={() => pushButton('LEFT')} className="absolute left-2 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white active:scale-95 rounded-full"><ChevronLeft size={24} /></RemoteBtn>
            <RemoteBtn id="RIGHT" onClick={() => pushButton('RIGHT')} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white active:scale-95 rounded-full"><ChevronRight size={24} /></RemoteBtn>
            
            {/* OK Button */}
            <RemoteBtn 
                id="ENTER"
                onClick={() => pushButton('ENTER')}
                className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-xs font-bold tracking-widest active:scale-95"
            >
                OK
            </RemoteBtn>
        </div>

        {/* Navigation Actions */}
        <div className="flex justify-around px-4">
            <RemoteBtn id="BACK" onClick={() => pushButton('BACK')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors p-2 rounded-lg">
                <Reply size={20} /> <span className="text-[9px] uppercase">Voltar</span>
            </RemoteBtn>
            <RemoteBtn id="HOME" onClick={() => pushButton('HOME')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors p-2 rounded-lg">
                <Home size={20} /> <span className="text-[9px] uppercase">Home</span>
            </RemoteBtn>
            <RemoteBtn id="MENU" onClick={() => pushButton('MENU')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white transition-colors p-2 rounded-lg">
                <Menu size={20} /> <span className="text-[9px] uppercase">Menu</span>
            </RemoteBtn>
        </div>

        {/* Vol / Channel Bars */}
        <div className="grid grid-cols-2 gap-4">
            {/* Volume */}
            <div className="bg-white/5 rounded-2xl p-2 flex flex-col gap-2 items-center">
                <RemoteBtn id="VOL_UP" onClick={() => handleVolume('up')} className="w-full py-3 hover:bg-white/10 rounded-xl text-white/70 flex justify-center"><Plus size={20} /></RemoteBtn>
                <span className="text-xs font-bold text-white/30 uppercase">Vol</span>
                <RemoteBtn id="VOL_DOWN" onClick={() => handleVolume('down')} className="w-full py-3 hover:bg-white/10 rounded-xl text-white/70 flex justify-center"><Minus size={20} /></RemoteBtn>
            </div>
             {/* Channel */}
             <div className="bg-white/5 rounded-2xl p-2 flex flex-col gap-2 items-center">
                <RemoteBtn id="CH_UP" onClick={() => handleChannel('up')} className="w-full py-3 hover:bg-white/10 rounded-xl text-white/70 flex justify-center"><ChevronUp size={20} /></RemoteBtn>
                <span className="text-xs font-bold text-white/30 uppercase">Ch</span>
                <RemoteBtn id="CH_DOWN" onClick={() => handleChannel('down')} className="w-full py-3 hover:bg-white/10 rounded-xl text-white/70 flex justify-center"><ChevronDown size={20} /></RemoteBtn>
            </div>
        </div>

        {/* Mute & Input Row */}
        <div className="grid grid-cols-3 gap-2">
             <RemoteBtn id="MUTE" onClick={() => sendCommand('mute')} className="bg-white/5 hover:bg-white/10 py-3 rounded-xl text-white/70 flex justify-center"><VolumeX size={18} /></RemoteBtn>
             <RemoteBtn id="INPUT" onClick={() => pushButton('INPUT')} className="bg-white/5 hover:bg-white/10 py-3 rounded-xl text-white/70 flex justify-center"><Monitor size={18} /></RemoteBtn>
             <RemoteBtn id="EXIT" onClick={() => pushButton('EXIT')} className="bg-white/5 hover:bg-white/10 py-3 rounded-xl text-white/70 text-[10px] font-bold uppercase tracking-wider">Exit</RemoteBtn>
        </div>

        {/* Media Controls */}
        <div className="flex justify-center gap-6 py-2 border-t border-b border-white/5">
            <RemoteBtn id="PLAY" onClick={() => sendCommand('play')} className="text-white/50 hover:text-white p-2 rounded-lg"><Play size={20} /></RemoteBtn>
            <RemoteBtn id="PAUSE" onClick={() => sendCommand('pause')} className="text-white/50 hover:text-white p-2 rounded-lg"><Pause size={20} /></RemoteBtn>
            <RemoteBtn id="STOP" onClick={() => sendCommand('stop')} className="text-white/50 hover:text-white p-2 rounded-lg"><Square size={18} fill="currentColor" /></RemoteBtn>
        </div>

        {/* Colored Buttons */}
        <div className="flex justify-center gap-4">
            <RemoteBtn id="RED" onClick={() => pushButton('RED')} className="w-8 h-3 rounded-full bg-red-600/60 hover:bg-red-500 border border-white/10"></RemoteBtn>
            <RemoteBtn id="GREEN" onClick={() => pushButton('GREEN')} className="w-8 h-3 rounded-full bg-green-600/60 hover:bg-green-500 border border-white/10"></RemoteBtn>
            <RemoteBtn id="YELLOW" onClick={() => pushButton('YELLOW')} className="w-8 h-3 rounded-full bg-yellow-600/60 hover:bg-yellow-500 border border-white/10"></RemoteBtn>
            <RemoteBtn id="BLUE" onClick={() => pushButton('BLUE')} className="w-8 h-3 rounded-full bg-blue-600/60 hover:bg-blue-500 border border-white/10"></RemoteBtn>
        </div>

        {/* App Shortcuts */}
        <div className="grid grid-cols-3 gap-2">
            {APPS.map(app => (
                <RemoteBtn 
                    id={`APP_${app.id}`}
                    key={app.id}
                    onClick={() => launchApp(app.name)}
                    className="py-2 px-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] uppercase tracking-wide truncate transition-colors"
                >
                    {app.name}
                </RemoteBtn>
            ))}
        </div>

    </GlassCard>
  );
};
