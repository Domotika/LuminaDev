import React from 'react';
import { Device, Favorite, DeviceType } from '../types';
import { GlassCard } from './GlassCard';
import { Star, Power, Lock, Unlock, ChevronUp, ChevronDown } from 'lucide-react';
import { getIconForDevice } from './Icons';
import { sendHubitatCommand } from '../services/hubitatService';

interface FavoritesBarProps {
  favorites: Favorite[];
  devices: Record<string, Device>;
  onDeviceUpdate: (deviceId: string, newState: Partial<Device['state']>) => void;
  onEditFavorites?: () => void;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({ 
  favorites, 
  devices, 
  onDeviceUpdate,
  onEditFavorites 
}) => {
  if (favorites.length === 0) {
    return null;
  }

  // Sort by order and get devices
  const sortedFavorites = [...favorites]
    .sort((a, b) => a.order - b.order)
    .slice(0, 5) // Max 5 favorites
    .map(f => devices[f.deviceId])
    .filter(Boolean);

  if (sortedFavorites.length === 0) {
    return null;
  }

  const handleQuickAction = async (device: Device) => {
    const newState = !device.state.isOn;
    
    // Optimistic update
    onDeviceUpdate(device.id, { isOn: newState });

    // Send command based on device type
    if (device.type === DeviceType.LOCK) {
      await sendHubitatCommand(device.hubitatId, newState ? 'unlock' : 'lock');
    } else if (device.type === DeviceType.BLIND) {
      await sendHubitatCommand(device.hubitatId, newState ? 'open' : 'close');
    } else {
      await sendHubitatCommand(device.hubitatId, newState ? 'on' : 'off');
    }
  };

  const getStatusText = (device: Device) => {
    if (device.type === DeviceType.LOCK) {
      return device.state.isLocked ? 'Trancado' : 'Aberto';
    }
    if (device.type === DeviceType.BLIND) {
      return device.state.level !== undefined ? `${device.state.level}%` : 
             device.state.isOn ? 'Aberta' : 'Fechada';
    }
    if (device.type === DeviceType.DIMMER && device.state.level !== undefined) {
      return device.state.isOn ? `${device.state.level}%` : 'Off';
    }
    return device.state.isOn ? 'On' : 'Off';
  };

  const getActionIcon = (device: Device) => {
    if (device.type === DeviceType.LOCK) {
      return device.state.isLocked ? <Unlock size={14} /> : <Lock size={14} />;
    }
    if (device.type === DeviceType.BLIND) {
      return device.state.isOn ? <ChevronDown size={14} /> : <ChevronUp size={14} />;
    }
    return <Power size={14} />;
  };

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star size={14} className="text-yellow-400" />
          <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Favoritos</span>
        </div>
        {onEditFavorites && (
          <button 
            onClick={onEditFavorites}
            className="text-[10px] text-white/40 hover:text-white/70 transition-colors"
          >
            Editar
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
        {sortedFavorites.map((device) => (
          <button
            key={device.id}
            onClick={() => handleQuickAction(device)}
            className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl border transition-all duration-300 min-w-[140px] ${
              device.state.isOn 
                ? 'bg-white/20 border-white/30 shadow-lg shadow-white/10' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className={`p-2 rounded-full ${
              device.state.isOn ? 'bg-white/30 text-white' : 'bg-white/10 text-white/50'
            }`}>
              {getIconForDevice(device.type, device.state.isOn)}
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-white truncate max-w-[80px]">
                {device.name}
              </p>
              <p className={`text-[10px] ${device.state.isOn ? 'text-white/80' : 'text-white/40'}`}>
                {getStatusText(device)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FavoritesBar;
