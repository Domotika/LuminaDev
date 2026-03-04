import React, { useState, useCallback, useRef, useEffect, forwardRef } from 'react';
import { Device, DeviceType } from '../types';
import { getIconForDevice } from './Icons';
import { GlassCard } from './GlassCard';
import { sendHubitatCommand, getButtonMapping, saveButtonMapping } from '../services/hubitatService';
import { ChevronRight, Minus, Plus, MoreVertical, Copy, Trash2, Link, Save, X, PenLine, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, Settings, Sun, Thermometer, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, Home, Power, Tv, Circle } from 'lucide-react';

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
  const [showConfig, setShowConfig] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState(device.name);
  const [selectedTargetId, setSelectedTargetId] = useState(device.targetDeviceId || 'none');
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [editingButtonId, setEditingButtonId] = useState<string | null>(null);
  const [bindTargetId, setBindTargetId] = useState<string>('none');

  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
      setMapping(getButtonMapping());
  }, []);

  useEffect(() => {
      setSelectedTargetId(device.targetDeviceId || 'none');
  }, [device.targetDeviceId]);

  const getTargetDevice = () => {
    if (!device.targetDeviceId) return device;
    return allDevices.find(d => d.id === device.targetDeviceId) || device;
  };

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
              // CORRIGIDO: Parâmetros posicionais
              await sendHubitatCommand(target.hubitatId, cmd);
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

  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    onBeforeCommand?.();
    setIsChanging(true);
    
    const target = getTargetDevice();
    const newStatus = !target.state.isOn;
    const command = newStatus ? 'on' : 'off';
    
    onUpdate(device.id, { isOn: newStatus });
    if (target.id !== device.id) {
        onUpdate(target.id, { isOn: newStatus });
    }

    // CORRIGIDO: Parâmetros posicionais
    await sendHubitatCommand(target.hubitatId, command);
    
    setIsChanging(false);
  }, [device, onUpdate, allDevices]);

  const handleLevelChange = useCallback(async (e: React.MouseEvent, delta: number) => {
    onBeforeCommand?.();

    e.stopPropagation();
    const target = getTargetDevice();
    const currentLevel = target.state.level || 0;
    const newLevel = Math.min(100, Math.max(0, currentLevel + delta));
    
    onUpdate(device.id, { level: newLevel });
    if (target.id !== device.id) {
        onUpdate(target.id, { level: newLevel });
    }
    
    // CORRIGIDO: Parâmetros posicionais
    await sendHubitatCommand(target.hubitatId, 'setLevel', [newLevel]);
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

      // CORRIGIDO: Parâmetros posicionais
      await sendHubitatCommand(target.hubitatId, cmd);
  }, [device, onUpdate, allDevices]);

  // --- TV/Media Commands ---
  const handleTVCommand = useCallback(async (e: React.MouseEvent, cmd: string, args?: (string | number)[]) => {
    onBeforeCommand?.();
    e.stopPropagation();
    const target = getTargetDevice();
    
    // DEBUG: Log completo do target
    console.log('[Lumina TV Cmd] DEBUG target:', JSON.stringify({
      id: target?.id,
      hubitatId: target?.hubitatId,
      name: target?.name,
      type: target?.type
    }), 'cmd:', cmd);
    
    // Validação
    const deviceId = target?.hubitatId || target?.id;
    if (!deviceId || typeof deviceId === 'object') {
      console.error('[Lumina TV Cmd] Invalid device ID!', deviceId);
      return;
    }
    
    // Atualização otimista do estado
    if (cmd === 'mute') onUpdate(device.id, { mute: true });
    if (cmd === 'unmute') onUpdate(device.id, { mute: false });
    if (cmd === 'play') onUpdate(device.id, { transportStatus: 'playing' });
    if (cmd === 'pause') onUpdate(device.id, { transportStatus: 'paused' });
    if (cmd === 'stop') onUpdate(device.id, { transportStatus: 'stopped' });

    await sendHubitatCommand(String(deviceId), cmd, args);
  }, [device, onUpdate, allDevices]);

  const handleTVNavigation = useCallback(async (e: React.MouseEvent, button: string) => {
    onBeforeCommand?.();
    e.stopPropagation();
    const target = getTargetDevice();
    
    // DEBUG: Log completo do target
    console.log('[Lumina TV Nav] DEBUG target:', JSON.stringify({
      id: target?.id,
      hubitatId: target?.hubitatId,
      name: target?.name,
      type: target?.type
    }));
    
    // Garantir que target existe
    if (!target || typeof target !== 'object') {
      console.error('[Lumina TV Nav] Invalid target!', target);
      return;
    }
    
    // Garantir que temos um ID válido (hubitatId ou id como fallback)
    const deviceId = target.hubitatId || target.id;
    if (!deviceId || typeof deviceId === 'object') {
      console.error('[Lumina TV Nav] Invalid device ID!', deviceId, 'target:', target);
      return;
    }
    
    // Detecta se é LG pelo nome (LG, webOS, LGTV)
    const nameLower = (target.name || '').toLowerCase();
    const isLG = nameLower.includes('lg') || 
                 nameLower.includes('webos') ||
                 nameLower.includes('lgtv');
    
    console.log('[Lumina TV Nav] Device:', target.name, 'ID:', deviceId, 'isLG:', isLG, 'Button:', button);
    
    if (isLG) {
      // LG webOS: usa pushRemoteButtons com nomes de botões em MAIÚSCULO
      console.log('[Lumina TV Nav] Sending LG command: pushRemoteButtons', button);
      await sendHubitatCommand(String(deviceId), 'pushRemoteButtons', [button]);
    } else {
      // Samsung/Outros: usa comandos diretos
      const buttonCommands: Record<string, string> = {
        'UP': 'arrowUp',
        'DOWN': 'arrowDown', 
        'LEFT': 'arrowLeft',
        'RIGHT': 'arrowRight',
        'ENTER': 'enter',
        'BACK': 'Return',
        'HOME': 'home',
        'EXIT': 'exit'
      };
      const directCommand = buttonCommands[button];
      console.log('[Lumina TV Nav] Sending Samsung command:', directCommand);
      if (directCommand) {
        await sendHubitatCommand(String(deviceId), directCommand);
      }
    }
  }, [device, allDevices]);

  const handleStartActivity = useCallback(async (e: React.MouseEvent, appName: string) => {
    onBeforeCommand?.();
    e.stopPropagation();
    const target = getTargetDevice();
    const deviceId = target.hubitatId || target.id;
    if (!deviceId || !appName) {
      console.error('[Lumina TV] Invalid params for startActivity', { deviceId, appName });
      return;
    }
    console.log('[Lumina TV] Starting activity:', appName, 'on device:', deviceId);
    await sendHubitatCommand(deviceId, 'startActivity', [appName]);
  }, [device, allDevices]);

  const handleSceneActivate = useCallback(async () => {
    onBeforeCommand?.();
    setIsChanging(true);
    
    const target = getTargetDevice();
    onUpdate(device.id, { activeScene: true });

    // Debug log
    console.log('[Lumina Scene] Device:', device.name, 'Type:', device.type);
    console.log('[Lumina Scene] Target:', target.name, 'Type:', target.type, 'HubitatId:', target.hubitatId);

    // Determinar comando baseado no tipo do dispositivo alvo
    // Virtual Switches, Switches, Lights e Scene Activators usam 'on'
    // Botões (PushableButton detectados como BUTTON) usam 'push' com número
    const usesOnCommand = 
        target.type === DeviceType.SWITCH || 
        target.type === DeviceType.LIGHT || 
        target.type === DeviceType.SCENE ||
        target.type === DeviceType.DIMMER;
    
    if (usesOnCommand) {
        console.log('[Lumina Scene] Sending ON command');
        await sendHubitatCommand(target.hubitatId, 'on');
    } else {
        // Botões (PushableButton) precisam de 'push' com número do botão
        console.log('[Lumina Scene] Sending PUSH/1 command');
        const buttonNumber = 1;
        await sendHubitatCommand(target.hubitatId, 'push', [buttonNumber]);
    }
    
    setTimeout(() => onUpdate(device.id, { activeScene: false }), 2000);
    setIsChanging(false);
  }, [device, onUpdate, allDevices]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const renderContent = () => {
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

    if (device.type === DeviceType.THERMOSTAT || device.type === DeviceType.AC) {
        return (
            <div className="flex flex-col gap-2 pt-2">
                 <div className="flex items-center justify-between pr-14">
                    <span className="text-2xl font-light">{device.state.temperature || '--'}°</span>
                    <div className="flex flex-col text-[10px] text-white/50 text-right">
                        <span>Set: {device.state.setpoint || '--'}°</span>
                        <span className="uppercase tracking-widest">{device.state.mode || 'off'}</span>
                    </div>
                 </div>
                 <div className="mt-2">
                    <h3 className="font-medium text-white text-base leading-tight pr-6">{device.name}</h3>
                 </div>
            </div>
        )
    }

    // --- TV UI (Controle Remoto Completo) ---
    if (device.type === DeviceType.TV) {
        const isMuted = device.state.mute === true || device.state.mute === 'muted';
        
        return (
            <div className="flex flex-col h-full pt-1">
                {/* Header: Nome + Power */}
                <div className="flex justify-between items-center mb-2 pr-10">
                    <div className="flex items-center gap-2">
                        <Tv size={16} className={device.state.isOn ? 'text-purple-400' : 'text-white/30'} />
                        <h3 className="font-medium text-white text-sm truncate max-w-[120px]">{device.name}</h3>
                    </div>
                    <button 
                        onClick={handleToggle}
                        onMouseDown={e => e.stopPropagation()}
                        className={`p-2 rounded-full transition-all ${device.state.isOn ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40' : 'bg-green-500/20 text-green-400 hover:bg-green-500/40'}`}
                        title={device.state.isOn ? 'Desligar' : 'Ligar'}
                    >
                        <Power size={14} />
                    </button>
                </div>

                {/* Status */}
                <p className="text-[9px] text-white/40 mb-2">
                    {device.state.isOn ? '● Ligada' : '○ Desligada'}
                    {device.state.currentApp && ` • ${device.state.currentApp}`}
                    {device.state.channelName && ` • ${device.state.channelName}`}
                </p>

                {device.state.isOn && (
                    <>
                        {/* Navegação D-Pad */}
                        <div className="flex flex-col items-center gap-1 mb-2">
                            <button 
                                onClick={(e) => handleTVNavigation(e, 'UP')}
                                onMouseDown={e => e.stopPropagation()}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-all"
                            >
                                <ArrowUp size={14} />
                            </button>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={(e) => handleTVNavigation(e, 'LEFT')}
                                    onMouseDown={e => e.stopPropagation()}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-all"
                                >
                                    <ArrowLeft size={14} />
                                </button>
                                <button 
                                    onClick={(e) => handleTVNavigation(e, 'ENTER')}
                                    onMouseDown={e => e.stopPropagation()}
                                    className="p-3 bg-purple-500/30 hover:bg-purple-500/50 rounded-full text-white font-bold text-[10px] transition-all"
                                >
                                    OK
                                </button>
                                <button 
                                    onClick={(e) => handleTVNavigation(e, 'RIGHT')}
                                    onMouseDown={e => e.stopPropagation()}
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-all"
                                >
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                            <button 
                                onClick={(e) => handleTVNavigation(e, 'DOWN')}
                                onMouseDown={e => e.stopPropagation()}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/70 hover:text-white transition-all"
                            >
                                <ArrowDown size={14} />
                            </button>
                        </div>

                        {/* Botões de Ação: Back, Home */}
                        <div className="flex justify-center gap-4 mb-2">
                            <button 
                                onClick={(e) => handleTVNavigation(e, 'BACK')}
                                onMouseDown={e => e.stopPropagation()}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[9px] text-white/70 hover:text-white transition-all"
                            >
                                ← Voltar
                            </button>
                            <button 
                                onClick={(e) => handleTVNavigation(e, 'HOME')}
                                onMouseDown={e => e.stopPropagation()}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[9px] text-white/70 hover:text-white transition-all flex items-center gap-1"
                            >
                                <Home size={10} /> Home
                            </button>
                        </div>

                        {/* Volume + Mute + Canais */}
                        <div className="flex justify-between items-center gap-2 mb-2">
                            {/* Volume */}
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={(e) => handleTVCommand(e, 'volumeDown')}
                                    onMouseDown={e => e.stopPropagation()}
                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white/70 hover:text-white transition-all"
                                    title="Volume -"
                                >
                                    <Minus size={12} />
                                </button>
                                <button 
                                    onClick={(e) => handleTVCommand(e, isMuted ? 'unmute' : 'mute')}
                                    onMouseDown={e => e.stopPropagation()}
                                    className={`p-1.5 rounded transition-all ${isMuted ? 'bg-red-500/30 text-red-400' : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'}`}
                                    title={isMuted ? 'Desmutar' : 'Mutar'}
                                >
                                    {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                </button>
                                <button 
                                    onClick={(e) => handleTVCommand(e, 'volumeUp')}
                                    onMouseDown={e => e.stopPropagation()}
                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white/70 hover:text-white transition-all"
                                    title="Volume +"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>

                            {/* Canais */}
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={(e) => handleTVCommand(e, 'channelDown')}
                                    onMouseDown={e => e.stopPropagation()}
                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-[9px] text-white/70 hover:text-white transition-all"
                                    title="Canal -"
                                >
                                    CH-
                                </button>
                                <button 
                                    onClick={(e) => handleTVCommand(e, 'channelUp')}
                                    onMouseDown={e => e.stopPropagation()}
                                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-[9px] text-white/70 hover:text-white transition-all"
                                    title="Canal +"
                                >
                                    CH+
                                </button>
                            </div>
                        </div>

                        {/* Media Controls */}
                        <div className="flex justify-center gap-2 mb-2">
                            <button 
                                onClick={(e) => handleTVCommand(e, 'play')}
                                onMouseDown={e => e.stopPropagation()}
                                className="p-1.5 bg-white/10 hover:bg-green-500/30 rounded text-white/70 hover:text-green-400 transition-all"
                                title="Play"
                            >
                                <Play size={12} />
                            </button>
                            <button 
                                onClick={(e) => handleTVCommand(e, 'pause')}
                                onMouseDown={e => e.stopPropagation()}
                                className="p-1.5 bg-white/10 hover:bg-yellow-500/30 rounded text-white/70 hover:text-yellow-400 transition-all"
                                title="Pause"
                            >
                                <Pause size={12} />
                            </button>
                            <button 
                                onClick={(e) => handleTVCommand(e, 'stop')}
                                onMouseDown={e => e.stopPropagation()}
                                className="p-1.5 bg-white/10 hover:bg-red-500/30 rounded text-white/70 hover:text-red-400 transition-all"
                                title="Stop"
                            >
                                <Square size={10} fill="currentColor" />
                            </button>
                        </div>

                        {/* Apps Rápidos */}
                        <div className="flex justify-center gap-1 flex-wrap">
                            <button 
                                onClick={(e) => handleStartActivity(e, 'Netflix')}
                                onMouseDown={e => e.stopPropagation()}
                                className="px-2 py-1 bg-red-600/30 hover:bg-red-600/50 rounded text-[8px] text-red-200 font-bold transition-all"
                            >
                                NETFLIX
                            </button>
                            <button 
                                onClick={(e) => handleStartActivity(e, 'YouTube')}
                                onMouseDown={e => e.stopPropagation()}
                                className="px-2 py-1 bg-red-500/30 hover:bg-red-500/50 rounded text-[8px] text-white font-bold transition-all"
                            >
                                YT
                            </button>
                            <button 
                                onClick={(e) => handleStartActivity(e, 'Prime Video')}
                                onMouseDown={e => e.stopPropagation()}
                                className="px-2 py-1 bg-blue-500/30 hover:bg-blue-500/50 rounded text-[8px] text-blue-200 font-bold transition-all"
                            >
                                PRIME
                            </button>
                            <button 
                                onClick={(e) => handleStartActivity(e, 'Live TV')}
                                onMouseDown={e => e.stopPropagation()}
                                className="px-2 py-1 bg-green-500/30 hover:bg-green-500/50 rounded text-[8px] text-green-200 font-bold transition-all"
                            >
                                TV
                            </button>
                        </div>
                    </>
                )}
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
                        {device.state.windowShade || (device.state.level === 0 ? 'Fechada' : 'Aberta')}
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

    // --- BOTÃO IR (Child Button from Molsmart) ---
    if (device.type === DeviceType.BUTTON) {
      const handleButtonPush = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsChanging(true);
        onBeforeCommand?.();
        // Child buttons usam comando "on" que aciona o handler do parent
        await sendHubitatCommand(device.hubitatId, 'on');
        setTimeout(() => setIsChanging(false), 300);
      };

      return (
        <div className="flex flex-col h-full justify-between pt-2">
          <div className="flex justify-between items-start pr-14">
            <div className={`transition-all duration-300 ${isChanging ? 'text-purple-400 scale-110' : 'text-white/70'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <button
              onClick={handleButtonPush}
              onMouseDown={e => e.stopPropagation()}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isChanging 
                  ? 'bg-purple-500 text-white scale-95' 
                  : 'bg-white/10 text-white/80 hover:bg-purple-500/50 active:scale-95'
              }`}
            >
              {isChanging ? '...' : 'Enviar'}
            </button>
          </div>
          <div className="mt-4">
            <h3 className="font-medium text-white text-base leading-tight pr-6">{device.name}</h3>
            <p className="text-white/40 text-[10px] mt-1">Botão IR/RF</p>
          </div>
        </div>
      );
    }

    // --- CONTROLE REMOTO IR (Molsmart GW8 Parent) ---
    if (device.type === DeviceType.IR_REMOTE) {
      const numButtons = device.state.numberOfButtons || 30;
      
      const handlePush = async (buttonNum: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsChanging(true);
        onBeforeCommand?.();
        await sendHubitatCommand(device.hubitatId, 'push', [buttonNum]);
        setTimeout(() => setIsChanging(false), 200);
      };

      // Determina se é controle de TV ou AC baseado no nome
      const isTV = device.name.toLowerCase().includes('tv');
      const isAC = device.name.toLowerCase().includes('ac') || device.name.toLowerCase().includes('ar ');

      // Layout simplificado com botões principais
      return (
        <div className="flex flex-col h-full pt-2">
          <div className="flex justify-between items-start pr-14 mb-3">
            <div className="text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2"/>
                <line x1="12" y1="18" x2="12" y2="18"/>
                <path d="M9 6h6"/><path d="M9 10h6"/><path d="M9 14h6"/>
              </svg>
            </div>
            <span className="text-[9px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
              {isTV ? 'TV IR' : isAC ? 'AC IR' : 'IR/RF'}
            </span>
          </div>

          <h3 className="font-medium text-white text-sm leading-tight pr-6 mb-3">{device.name}</h3>

          {/* Grid de botões rápidos */}
          <div className="grid grid-cols-3 gap-1.5 mt-auto">
            {isTV ? (
              <>
                <button onClick={(e) => handlePush(1, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded text-[10px] text-green-300 transition-all"><Power size={14} className="mx-auto"/></button>
                <button onClick={(e) => handlePush(2, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all"><VolumeX size={14} className="mx-auto"/></button>
                <button onClick={(e) => handlePush(3, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all">SRC</button>
                <button onClick={(e) => handlePush(21, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all"><Volume2 size={14} className="mx-auto"/>+</button>
                <button onClick={(e) => handlePush(12, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-blue-500/30 hover:bg-blue-500/50 rounded text-[10px] text-blue-300 transition-all">OK</button>
                <button onClick={(e) => handlePush(18, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all">CH+</button>
                <button onClick={(e) => handlePush(22, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all"><Volume2 size={14} className="mx-auto"/>-</button>
                <button onClick={(e) => handlePush(14, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all"><Home size={14} className="mx-auto"/></button>
                <button onClick={(e) => handlePush(19, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all">CH-</button>
              </>
            ) : isAC ? (
              <>
                <button onClick={(e) => handlePush(1, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded text-[10px] text-green-300 transition-all"><Power size={14} className="mx-auto"/></button>
                <button onClick={(e) => handlePush(26, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all">Mode</button>
                <button onClick={(e) => handlePush(2, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded text-[10px] text-red-300 transition-all"><Power size={14} className="mx-auto"/></button>
                <button onClick={(e) => handlePush(17, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-blue-500/30 hover:bg-blue-500/50 rounded text-[10px] text-blue-300 transition-all">▲</button>
                <button onClick={(e) => handlePush(33, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all">Fan</button>
                <button onClick={(e) => handlePush(21, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all">Swing</button>
                <button onClick={(e) => handlePush(18, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-orange-500/30 hover:bg-orange-500/50 rounded text-[10px] text-orange-300 transition-all">▼</button>
                <button onClick={(e) => handlePush(22, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all">Turbo</button>
                <button onClick={(e) => handlePush(28, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all">Timer</button>
              </>
            ) : (
              // Genérico - botões 1-9
              <>
                {[1,2,3,4,5,6,7,8,9].map(n => (
                  <button key={n} onClick={(e) => handlePush(n, e)} onMouseDown={e => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-all">{n}</button>
                ))}
              </>
            )}
          </div>

          <p className="text-white/30 text-[8px] mt-2 text-center">{numButtons} botões • push(n)</p>
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
                onMouseDown={e => e.stopPropagation()}
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

  const displayDevice = getTargetDevice();
  
  return (
      <GlassCard 
        ref={ref} 
        style={style} 
        className={`${className} p-4`} 
        onMouseDown={props.onMouseDown} 
        onMouseUp={props.onMouseUp} 
        onTouchEnd={props.onTouchEnd}
        active={displayDevice.state.isOn && device.type !== DeviceType.SCENE}
      >
          <div className="absolute top-2 right-2 z-20">
             <button onClick={toggleMenu} className="p-2 text-white/30 hover:text-white transition-colors" onMouseDown={e => e.stopPropagation()}>
                <MoreVertical size={16} />
             </button>
          </div>

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
