/**
 * SidebarLayout - Layout alternativo com menu lateral
 * Usado pelo tema SmartHome Pro
 * 
 * Baseado no design Crystalline do AI Studio
 */

import { useState } from 'react';
import { 
  Home, Clapperboard, Shield, Thermometer, Settings, 
  ChevronRight, Power, Wifi, WifiOff,
  LayoutGrid, Sun, Moon
} from 'lucide-react';
import { Device, DeviceType, Room } from '../types';
import { sendHubitatCommand } from '../services/hubitatService';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SidebarLayoutProps {
  rooms: Room[];
  devices: Record<string, Device>;
  currentRoomId: string | null;
  onRoomSelect: (roomId: string | null) => void;
  onSettingsClick: () => void;
  onDeviceUpdate: (deviceId: string, updates: Partial<Device['state']>) => void;
  isConnected: boolean;
  isDemoMode: boolean;
  brandName?: string;
}

type SidebarTab = 'ambiente' | 'cenas' | 'seguranca' | 'clima' | 'ajustes';

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR MENU
// ═══════════════════════════════════════════════════════════════════════════

const SIDEBAR_ITEMS: { id: SidebarTab; label: string; icon: any }[] = [
  { id: 'ambiente', label: 'Ambiente', icon: LayoutGrid },
  { id: 'cenas', label: 'Cenas', icon: Clapperboard },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'clima', label: 'Clima', icon: Thermometer },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
];

// ═══════════════════════════════════════════════════════════════════════════
// DEVICE CARD (Pro Style)
// ═══════════════════════════════════════════════════════════════════════════

interface DeviceCardProProps {
  device: Device;
  onUpdate: (deviceId: string, updates: Partial<Device['state']>) => void;
}

const DeviceCardPro = ({ device, onUpdate }: DeviceCardProProps) => {
  const isOn = device.state.isOn || false;
  const level = device.state.level || 0;
  const isDimmer = device.type === DeviceType.DIMMER || device.type === DeviceType.LIGHT;
  
  const handleToggle = async () => {
    const newState = !isOn;
    onUpdate(device.id, { isOn: newState });
    await sendHubitatCommand(device.hubitatId, newState ? 'on' : 'off');
  };
  
  const handleLevelChange = async (newLevel: number) => {
    onUpdate(device.id, { level: newLevel, isOn: newLevel > 0 });
    await sendHubitatCommand(device.hubitatId, 'setLevel', [newLevel]);
  };

  const getStatusText = () => {
    if (isDimmer && isOn) return `${level}%`;
    return isOn ? 'LIGADO' : 'DESLIGADO';
  };

  return (
    <div className="pro-card group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-medium text-sm">{device.name}</h3>
          <p className={`text-[10px] uppercase tracking-wider ${isOn ? 'text-cyan-400' : 'text-white/40'}`}>
            {getStatusText()}
          </p>
        </div>
        <button 
          onClick={handleToggle}
          className={`p-2 rounded-lg transition-all ${
            isOn 
              ? 'text-cyan-400 bg-cyan-400/10' 
              : 'text-white/30 hover:text-white/60 hover:bg-white/5'
          }`}
        >
          <Power size={18} />
        </button>
      </div>
      
      {/* Slider for dimmers */}
      {isDimmer && (
        <div className="mb-4">
          <div className="relative h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all"
              style={{ width: `${level}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={level}
              onChange={(e) => handleLevelChange(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          {/* Slider thumb indicator */}
          <div 
            className="relative h-3 -mt-2"
            style={{ paddingLeft: `calc(${level}% - 6px)` }}
          >
            <div className="w-3 h-3 bg-white rounded-full shadow-lg shadow-cyan-500/30" />
          </div>
        </div>
      )}
      
      {/* Action Button */}
      <button
        onClick={handleToggle}
        className={`w-full py-2.5 rounded-lg font-medium text-xs uppercase tracking-wider transition-all ${
          isOn
            ? 'bg-cyan-500 text-black hover:bg-cyan-400'
            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
        }`}
      >
        {isOn ? 'DESLIGAR' : 'LIGAR'}
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SIDEBAR LAYOUT
// ═══════════════════════════════════════════════════════════════════════════

export const SidebarLayout = ({
  rooms,
  devices,
  currentRoomId,
  onRoomSelect,
  onSettingsClick,
  onDeviceUpdate,
  isConnected,
  isDemoMode,
  brandName = 'SMARTHOME PRO'
}: SidebarLayoutProps) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('ambiente');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  
  // Get devices for current view
  const getVisibleDevices = () => {
    const allDevices = Object.values(devices);
    
    if (activeTab === 'ambiente') {
      if (selectedRoom) {
        return allDevices.filter(d => d.roomId === selectedRoom && d.roomId !== 'hidden');
      }
      return allDevices.filter(d => d.roomId !== 'hidden');
    }
    
    if (activeTab === 'cenas') {
      return allDevices.filter(d => d.type === DeviceType.SCENE);
    }
    
    if (activeTab === 'seguranca') {
      return allDevices.filter(d => 
        d.type === DeviceType.LOCK || 
        d.type === DeviceType.MOTION ||
        d.type === DeviceType.WATER ||
        d.type === DeviceType.SMOKE
      );
    }
    
    if (activeTab === 'clima') {
      return allDevices.filter(d => 
        d.type === DeviceType.AC || 
        d.type === DeviceType.THERMOSTAT
      );
    }
    
    return [];
  };
  
  const visibleDevices = getVisibleDevices();
  
  const handleTabClick = (tab: SidebarTab) => {
    if (tab === 'ajustes') {
      onSettingsClick();
    } else {
      setActiveTab(tab);
      setSelectedRoom(null);
    }
  };
  
  const getPageTitle = () => {
    if (activeTab === 'ambiente' && selectedRoom) {
      const room = rooms.find(r => r.id === selectedRoom);
      return room?.name || 'Ambiente';
    }
    const item = SIDEBAR_ITEMS.find(i => i.id === activeTab);
    return item?.label || 'Ambiente';
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0f] text-white overflow-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════
          SIDEBAR
      ═══════════════════════════════════════════════════════════════════ */}
      <aside className="w-56 flex-shrink-0 bg-black/40 border-r border-cyan-500/10 flex flex-col">
        
        {/* Brand */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rotate-45" />
            <span className="text-sm font-bold tracking-widest text-white">{brandName}</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </button>
            );
          })}
        </nav>
        
        {/* Room Selector (when in Ambiente) */}
        {activeTab === 'ambiente' && rooms.length > 0 && (
          <div className="p-3 border-t border-white/5">
            <p className="text-[9px] uppercase tracking-widest text-white/30 px-4 mb-2">Ambientes</p>
            <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setSelectedRoom(null)}
                className={`w-full text-left px-4 py-2 rounded text-xs transition-all ${
                  !selectedRoom ? 'text-cyan-400 bg-cyan-500/10' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                Todos
              </button>
              {rooms.filter(r => r.id !== 'hidden').map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full text-left px-4 py-2 rounded text-xs transition-all ${
                    selectedRoom === room.id ? 'text-cyan-400 bg-cyan-500/10' : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Status Footer */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi size={14} className="text-cyan-400" />
              ) : (
                <WifiOff size={14} className="text-red-400" />
              )}
              <span className="text-[10px] text-white/40 uppercase tracking-wider">Hubitat</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-400' : 'bg-red-400'}`} />
          </div>
          {isDemoMode && (
            <p className="text-[9px] text-cyan-400 uppercase tracking-widest mt-2">Demo Mode</p>
          )}
        </div>
      </aside>
      
      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="px-8 py-6 border-b border-white/5">
          <h1 className="text-3xl font-light text-white">{getPageTitle()}</h1>
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'ajustes' ? (
            <div className="text-white/50 text-center py-20">
              Carregando ajustes...
            </div>
          ) : visibleDevices.length === 0 ? (
            <div className="text-white/30 text-center py-20">
              <LayoutGrid size={48} className="mx-auto mb-4 opacity-30" />
              <p>Nenhum dispositivo encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleDevices.map(device => (
                <DeviceCardPro 
                  key={device.id} 
                  device={device} 
                  onUpdate={onDeviceUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
