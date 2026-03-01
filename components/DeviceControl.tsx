
import React, { useState, useCallback, useRef, useEffect, forwardRef } from 'react';
import { Device, DeviceType } from '../types';
import { getIconForDevice } from './Icons';
import { GlassCard } from './GlassCard';
import { sendHubitatCommand, getButtonMapping, saveButtonMapping } from '../services/hubitatService';
import { ChevronRight, Minus, Plus, MoreVertical, Copy, Trash2, Link, Save, X, PenLine, ArrowUp, ArrowDown, Square, Settings, Sun, Thermometer } from 'lucide-react';

interface DeviceControlProps extends React.HTMLAttributes<HTMLDivElement> {
  device: Device;
  allDevices?: Device[];
  onUpdate: (id: string, newState: Partial<Device['state']>) => void;
  onBeforeCommand?: () => void;
  onDuplicate?: (device: Device) => void;
  onDelete?: (deviceId: string) => void;
  onAssignAction?: (deviceId: string, targetId: string) => void;
  onRename?: (deviceId: string, newName: string) => void;
}

export const DeviceControl = forwardRef<HTMLDivElement, DeviceControlProps>(
  ({ device, allDevices = [], onUpdate, onBeforeCommand, onDuplicate, onDelete, onAssignAction, onRename, style, className = '', ...props }, ref) => {
  const [isChanging, setIsChanging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfig, setShowConfig] = useState(false); // For Scene linking
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState(device.name);
  const [selectedTargetId, setSelectedTargetId] = useState(device.targetDeviceId || 'none');
  
  // --- Button Mapping State (For Blinds) ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [editingButtonId, setEditingButtonId] = useState<string | null>(null);
  const [bindTargetId, setBindTargetId] = useState<string>('none');

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Load mappings on mount
  useEffect(() => {
      setMapping(getButtonMapping());
  }, []);

  // Sync internal state if prop changes
  useEffect(() => {
      setSelectedTargetId(device.targetDeviceId || 'none');
  }, [device.targetDeviceId]);

  const getTargetDevice = () => {
    if (!device.targetDeviceId) return device;
    return allDevices.find(d => d.id === device.targetDeviceId) || device;
  };

  // --- Button Mapping Logic ---
  const saveMapping = (newMap: Record<string, string>) => {
      setMapping(newMap);
      saveButtonMapping(newMap);
  };

  const getMappingKey = (btnId: string) => `${device.id}_${btnId}`;

  const handleButtonPress = async (btnId: string, defaultAction: (e: React.MouseEvent) => void, e: React.MouseEvent) => {
      if (isEditMode) {
          e.stopPropagation();
          setEditingButtonId(btnId);
          const currentTarget = mapping[getMappingKey(btnId)] || 'none';
          setBindTargetId(currentTarget);
          return;
      }

      const mappedTargetId = mapping[getMappingKey(btnId)];
      if (mappedTargetId) {
          e.stopPropagation();
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

      defaultAction(e);
  };

  const handleSaveBind = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!editingButtonId) return;
      
      const newMap = { ...mapping };
      const key = getMappingKey(editingButtonId);
      
      if (bindTargetId === 'none') {
          delete newMap[key];
      } else {
          newMap[key] = bindTargetId;
      }
      
      saveMapping(newMap);
      setEditingButtonId(null);
  };

  // --- Standard Actions ---

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    onBeforeCommand?.();
    // Only toggle if NOT dragging (handled by props passed from Grid Item mostly, but we can stop prop here)
    // Actually, simple click is fine. Dragging is handled by parent wrapper usually.
    // e.stopPropagation(); // Removed to allow grid dragging if clicked on edge
    setIsChanging(true);
    
    const target = getTargetDevice();
    const newStatus = !target.state.isOn;
    const command = newStatus ? 'on' : 'off';
    
    onUpdate(device.id, { isOn: newStatus });
    if (target.id !== device.id) {
        onUpdate(target.id, { isOn: newStatus });
    }

    await sendHubitatCommand({
      deviceId: target.hubitatId,
      command: command
    });
    
    setIsChanging(false);
  }, [device, onUpdate, allDevices]);

  const handleLevelChange = useCallback(async (e: React.MouseEvent, delta: number) => {
    onBeforeCommand?.();

    e.stopPropagation(); // Keep this to prevent dragging when clicking buttons
    const target = getTargetDevice();
    const currentLevel = target.state.level || 0;
    const newLevel = Math.min(100, Math.max(0, currentLevel + delta));
    
    onUpdate(device.id, { level: newLevel });
    if (target.id !== device.id) {
        onUpdate(target.id, { level: newLevel });
    }
    
    await sendHubitatCommand({
      deviceId: target.hubitatId,
      command: 'setLevel',
      arguments: [newLevel]
    });
  }, [device, onUpdate, allDevices]);

  const handleBlindCommand = useCallback(async (e: React.MouseEvent, cmd: string) => {
    onBeforeCommand?.();
      e.stopPropagation();
      const target = getTargetDevice();
      
      let updateState: Partial<Device['state']> = {};
      if (cmd === 'open') updateState = { windowShade: 'opening', isOn: true, level: 100 };
      if (cmd === 'close') updateState = { windowShade: 'closing', isOn: false, level: 0 };
      if (cmd === 'stopPositionChange') updateState = { windowShade: 'stopped' }; 

      onUpdate(device.id, updateState);

      await sendHubitatCommand({
          deviceId: target.hubitatId,
          command: cmd
      });
  }, [device, onUpdate, allDevices]);

  const handleSceneActivate = useCallback(async () => {
    onBeforeCommand?.();
    setIsChanging(true);
    
    const target = getTargetDevice();
    onUpdate(device.id, { activeScene: true });

    const isSwitch = target.type === DeviceType.SWITCH || target.type === DeviceType.LIGHT;
    const command = isSwitch ? 'on' : 'push';

    await sendHubitatCommand({ deviceId: target.hubitatId, command: command });
    
    setTimeout(() => onUpdate(device.id, { activeScene: false }), 2000);
    setIsChanging(false);
  }, [device, onUpdate, allDevices]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation(); // Important to stop drag start
    setShowMenu(!showMenu);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDuplicate) onDuplicate(device);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) onDelete(device.id);
  };

  const handleOpenConfig = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowConfig(true);
  };

  const handleSaveConfig = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAssignAction) {
        onAssignAction(device.id, selectedTargetId);
    }
    setShowConfig(false);
  };

  const handleOpenRename = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowMenu(false);
      setNewName(device.name);
      setShowRename(true);
  };

  const handleSaveRename = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onRename && newName.trim()) {
          onRename(device.id, newName.trim());
      }
      setShowRename(false);
  };

  // Content Renderer
  const renderContent = () => {
    // If in Rename Mode
    if (showRename) {
        return (
            <div className="flex flex-col h-full justify-between pt-1 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Renomear</span>
                    <button onClick={() => setShowRename(false)} className="text-white/50 hover:text-white"><X size={14} /></button>
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-2">
                    <input 
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-black/40 border border-white/20 rounded text-xs p-2 text-white focus:outline-none focus:border-blue-400"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(e as any);
                            if (e.key === 'Escape') setShowRename(false);
                        }}
                    />
                </div>

                <button 
                    onClick={handleSaveRename}
                    className="w-full bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white text-[10px] py-2 rounded uppercase tracking-wider font-bold transition-colors mt-2 flex items-center justify-center gap-2"
                >
                    <Save size={12} /> Salvar
                </button>
            </div>
        )
    }

    // If in Config Mode (Link Scene)
    if (showConfig) {
        return (
            <div className="flex flex-col h-full justify-between pt-1 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Vincular Ação</span>
                    <button onClick={() => setShowConfig(false)} className="text-white/50 hover:text-white"><X size={14} /></button>
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-2">
                    <p className="text-[9px] text-white/50 leading-tight">
                        Selecione o dispositivo a ser controlado. Para <strong>Rule Machine</strong>, use o Switch Virtual.
                    </p>
                    <select 
                        value={selectedTargetId}
                        onChange={(e) => setSelectedTargetId(e.target.value)}
                        className="w-full bg-black/40 border border-white/20 rounded text-[10px] p-2 text-white focus:outline-none focus:border-blue-400"
                    >
                        <option value="none">-- Padrão (Sem vínculo) --</option>
                        {allDevices.sort((a,b) => a.name.localeCompare(b.name)).map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                        ))}
                    </select>
                </div>

                <button 
                    onClick={handleSaveConfig}
                    className="w-full bg-blue-500/30 hover:bg-blue-500/50 border border-blue-500/50 text-white text-[10px] py-2 rounded uppercase tracking-wider font-bold transition-colors mt-2 flex items-center justify-center gap-2"
                >
                    <Save size={12} /> Salvar Vínculo
                </button>
            </div>
        );
    }

    // If in Button Mapping Edit Mode Modal
    if (editingButtonId) {
        return (
            <div className="flex flex-col h-full justify-between pt-1 animate-in fade-in zoom-in-95 duration-200 relative z-30" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Mapear Botão</span>
                    <button onClick={() => setEditingButtonId(null)} className="text-white/50 hover:text-white"><X size={14} /></button>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-2">
                    <p className="text-[9px] text-yellow-400 font-mono mb-1">Botão: {editingButtonId}</p>
                    <select 
                        value={bindTargetId}
                        onChange={(e) => setBindTargetId(e.target.value)}
                        className="w-full bg-black/40 border border-white/20 rounded text-[10px] p-2 text-white focus:outline-none focus:border-yellow-500"
                    >
                        <option value="none">-- Padrão (Persiana) --</option>
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
                    className="w-full bg-yellow-600/80 hover:bg-yellow-500 text-black text-[10px] py-2 rounded uppercase tracking-wider font-bold transition-colors mt-2 flex items-center justify-center gap-2"
                >
                    <Save size={12} /> Salvar Mapeamento
                </button>
            </div>
        )
    }

    if (device.type === DeviceType.THERMOSTAT) {
        return (
            <div className="flex flex-col gap-2 pt-2">
                 <div className="flex items-center justify-between pr-14">
                    <span className="text-2xl font-light">{device.state.temperature}°</span>
                    <div className="flex flex-col text-[10px] text-white/50 text-right">
                        <span>Set: {device.state.setpoint}°</span>
                        <span className="uppercase tracking-widest">{device.state.mode}</span>
                    </div>
                 </div>
            </div>
        )
    }

    // --- BLINDS UI ---
    if (device.type === DeviceType.BLIND) {
        const getBtnStyle = (btnId: string) => {
            const isBound = !!mapping[getMappingKey(btnId)];
            const activeClass = isEditMode ? 'ring-1 ring-yellow-500/50 bg-yellow-500/10' : '';
            const boundIndicator = isBound && !isEditMode ? 'text-blue-300' : 'text-white/70';
            return `${activeClass} ${boundIndicator}`;
        };

        return (
            <div className={`flex flex-col h-full justify-between pt-2 transition-all ${isEditMode ? 'opacity-100' : ''}`}>
                <div className="flex justify-between items-start pr-14">
                    {getIconForDevice(device.type, device.state.level !== 0)}
                    <span className="text-[10px] text-white/50 font-mono uppercase">
                        {device.state.windowShade || (device.state.level === 0 ? 'Closed' : 'Open')}
                    </span>
                </div>
                
                <div className="mt-2 mb-2">
                    <h3 className="font-medium text-white text-base leading-tight pr-6 truncate">{device.name}</h3>
                    {isEditMode && <span className="text-[9px] text-yellow-400 animate-pulse">MODO DE MAPEAMENTO</span>}
                </div>

                <div className="flex items-center gap-2 mt-auto">
                    <button 
                        onClick={(e) => handleButtonPress('CLOSE', (ev) => handleBlindCommand(ev, 'close'), e)}
                        className={`flex-1 bg-white/10 hover:bg-white/20 p-2 rounded-lg flex justify-center hover:text-white transition-all ${getBtnStyle('CLOSE')}`}
                        title="Fechar"
                        onMouseDown={e => e.stopPropagation()} 
                    >
                        <ArrowDown size={16} />
                    </button>
                    <button 
                        onClick={(e) => handleButtonPress('STOP', (ev) => handleBlindCommand(ev, 'stopPositionChange'), e)}
                        className={`flex-1 bg-white/10 hover:bg-white/20 p-2 rounded-lg flex justify-center hover:text-white transition-all ${getBtnStyle('STOP')}`}
                        title="Parar"
                        onMouseDown={e => e.stopPropagation()} 
                    >
                        <Square size={14} fill="currentColor" />
                    </button>
                    <button 
                        onClick={(e) => handleButtonPress('OPEN', (ev) => handleBlindCommand(ev, 'open'), e)}
                        className={`flex-1 bg-white/10 hover:bg-white/20 p-2 rounded-lg flex justify-center hover:text-white transition-all ${getBtnStyle('OPEN')}`}
                        title="Abrir"
                        onMouseDown={e => e.stopPropagation()} 
                    >
                        <ArrowUp size={16} />
                    </button>
                </div>
                
                {/* Optional Slider if position supported */}
                <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-400 transition-all duration-300" 
                            style={{ width: `${device.state.level || 0}%` }}
                        />
                    </div>
                </div>
            </div>
        )
    }

    if (device.type === DeviceType.SCENE) {
        return (
            <div className="flex items-center justify-between h-full pt-4 pr-14" onClick={handleSceneActivate}>
                <div className="flex flex-col">
                    <span className="text-xs font-medium tracking-wide">{device.name}</span>
                    {device.targetDeviceId && (
                        <span className="text-[9px] text-blue-300 flex items-center gap-1 mt-1">
                            <Link size={8} /> Vinculado
                        </span>
                    )}
                </div>
                <div className={`p-2 rounded-full border transition-all ${device.state.activeScene ? 'bg-white text-black border-white' : 'border-white/20 text-white/50'}`}>
                    <ChevronRight size={16} />
                </div>
            </div>
        )
    }

    // --- SENSOR UI (Motion/Presence) ---
    if (device.type === DeviceType.MOTION || device.type === DeviceType.PRESENCE) {
        const isActive = device.state.motion === 'active' || device.state.presence === 'present';
        return (
            <div className="flex flex-col h-full justify-between pt-2">
                <div className="flex justify-between items-start pr-14">
                    {getIconForDevice(device.type, isActive)}
                    <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${isActive ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                        {isActive ? 'Detectado' : 'Sem Movimento'}
                    </div>
                </div>
                
                <div className="mt-4">
                    <h3 className="font-medium text-white text-base leading-tight pr-6">{device.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                        {device.state.illuminance !== undefined && (
                            <span className="text-[10px] text-white/50 flex items-center gap-1">
                                <Sun size={10} /> {device.state.illuminance} lx
                            </span>
                        )}
                        {device.state.temperature !== undefined && (
                            <span className="text-[10px] text-white/50 flex items-center gap-1">
                                <Thermometer size={10} /> {device.state.temperature}°
                            </span>
                        )}
                        {device.state.battery !== undefined && (
                            <span className="text-[10px] text-white/50 flex items-center gap-1">
                                <span className={device.state.battery < 20 ? 'text-red-400' : ''}>{device.state.battery}%</span> Bat
                            </span>
                        )}
                    </div>
                </div>
            </div>
        )
    }
    // --- SENSOR DE ÁGUA ---
if (device.type === DeviceType.WATER) {
  const isWet = device.state.water === 'wet';
  return (
    <div className="flex flex-col h-full justify-between pt-2">
      <div className="flex justify-between items-start pr-14">
        {/* Ícone de gota */}
        <div className={`transition-all duration-300 ${isWet ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'text-white/40'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v1"/><path d="M5.2 11.2l.5.5"/><path d="M2 18h1"/><path d="M21 18h1"/><path d="M18.3 11.2l-.5.5"/>
            <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/><path d="m12 3 4 7H8l4-7z"/>
          </svg>
        </div>
        <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
          isWet 
            ? 'bg-blue-500/20 text-blue-200 border border-blue-500/30 animate-pulse' 
            : 'bg-white/10 text-white/40 border border-white/10'
        }`}>
          {isWet ? '⚠ ÁGUA DETECTADA' : 'Seco / Normal'}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-medium text-white text-base leading-tight pr-6">{device.name}</h3>
        <div className="flex items-center gap-3 mt-2">
          {device.state.temperature !== undefined && (
            <span className="text-[10px] text-white/50 flex items-center gap-1">
              🌡 {device.state.temperature}°
            </span>
          )}
          {device.state.battery !== undefined && (
            <span className={`text-[10px] flex items-center gap-1 ${device.state.battery < 20 ? 'text-red-400' : 'text-white/50'}`}>
              🔋 {device.state.battery}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SENSOR DE FUMAÇA ---
if (device.type === DeviceType.SMOKE) {
  const isDetected = device.state.smoke === 'detected';
  return (
    <div className="flex flex-col h-full justify-between pt-2">
      <div className="flex justify-between items-start pr-14">
        <div className={`transition-all duration-300 ${isDetected ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]' : 'text-white/40'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
            <path d="M16 17H7"/><path d="M17 21H9"/>
          </svg>
        </div>
        <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
          isDetected 
            ? 'bg-orange-500/20 text-orange-200 border border-orange-500/30 animate-pulse' 
            : 'bg-white/10 text-white/40 border border-white/10'
        }`}>
          {isDetected ? '🔥 FUMAÇA DETECTADA' : 'Normal'}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-medium text-white text-base leading-tight pr-6">{device.name}</h3>
        <div className="flex items-center gap-3 mt-2">
          {device.state.battery !== undefined && (
            <span className={`text-[10px] flex items-center gap-1 ${device.state.battery < 20 ? 'text-red-400' : 'text-white/50'}`}>
              🔋 {device.state.battery}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
    // Default Dimmer/Switch layout
    const displayDevice = getTargetDevice();
    
    return (
      <div className="flex flex-col h-full justify-between pt-2">
        <div className="flex justify-between items-start pr-14">
            {getIconForDevice(device.type, !!displayDevice.state.isOn)}
            <div 
                onClick={handleToggle}
                onMouseDown={e => e.stopPropagation()} // Stop drag when toggling switch
                className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer ${displayDevice.state.isOn ? 'bg-green-500/80' : 'bg-white/10'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${displayDevice.state.isOn ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
        </div>
        
        <div className="mt-4">
            <h3 className="font-medium text-white text-base leading-tight pr-6">{device.name}</h3>
            <p className="text-white/50 text-[10px] mt-1 flex items-center gap-1">
                {displayDevice.state.isOn ? 'Ligado' : 'Desligado'} 
                {displayDevice.state.level !== undefined && displayDevice.state.isOn && ` • ${displayDevice.state.level}%`}
                {device.targetDeviceId && <Link size={8} className="text-blue-400 ml-1" />}
            </p>
        </div>

        {/* Slider Simulation for Dimmers */}
        {(device.type === DeviceType.DIMMER || device.type === DeviceType.MEDIA) && displayDevice.state.isOn && (
            <div className="mt-4 flex items-center gap-2">
                <button onClick={(e) => handleLevelChange(e, -10)} className="p-1 hover:bg-white/10 rounded" onMouseDown={e => e.stopPropagation()}><Minus size={14} /></button>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-white transition-all duration-300" 
                        style={{ width: `${displayDevice.state.level}%` }}
                    />
                </div>
                <button onClick={(e) => handleLevelChange(e, 10)} className="p-1 hover:bg-white/10 rounded" onMouseDown={e => e.stopPropagation()}><Plus size={14} /></button>
            </div>
        )}
      </div>
    );
  };

  // Main wrapper: GlassCard
  // Pass ref and style from Grid Layout to GlassCard
  const displayDevice = getTargetDevice();
  
  return (
      <GlassCard 
        ref={ref} 
        style={style} 
        className={`${className} p-4`} 
        onMouseDown={props.onMouseDown} 
        onMouseUp={props.onMouseUp} 
        onTouchEnd={props.onTouchEnd}
        // ... pass other grid props if necessary
        active={displayDevice.state.isOn && device.type !== DeviceType.SCENE}
      >
          {/* Absolute Positioned Menu Trigger */}
          <div className="absolute top-2 right-2 z-20">
             <button onClick={toggleMenu} className="p-2 text-white/30 hover:text-white transition-colors" onMouseDown={e => e.stopPropagation()}>
                <MoreVertical size={16} />
             </button>
          </div>

          {/* Context Menu */}
          {showMenu && (
              <div className="absolute top-8 right-2 w-32 bg-black/90 border border-white/10 backdrop-blur-xl rounded-lg shadow-2xl z-30 overflow-hidden animate-in fade-in zoom-in-95">
                  <button onClick={handleOpenRename} className="w-full text-left px-3 py-2 text-[10px] text-white hover:bg-white/10 flex items-center gap-2"><PenLine size={12} /> Renomear</button>
                  <button onClick={handleOpenConfig} className="w-full text-left px-3 py-2 text-[10px] text-white hover:bg-white/10 flex items-center gap-2"><Link size={12} /> Vincular</button>
                  {device.type === DeviceType.BLIND && (
                      <button onClick={() => { setIsEditMode(!isEditMode); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-[10px] text-yellow-400 hover:bg-white/10 flex items-center gap-2"><Settings size={12} /> Mapear Botões</button>
                  )}
                  {onDuplicate && <button onClick={handleDuplicate} className="w-full text-left px-3 py-2 text-[10px] text-white hover:bg-white/10 flex items-center gap-2"><Copy size={12} /> Duplicar</button>}
                  {onDelete && <button onClick={handleDelete} className="w-full text-left px-3 py-2 text-[10px] text-red-400 hover:bg-white/10 flex items-center gap-2"><Trash2 size={12} /> Excluir</button>}
              </div>
          )}

          {renderContent()}
      </GlassCard>
  );
  }
);

DeviceControl.displayName = 'DeviceControl';
