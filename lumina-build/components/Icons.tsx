
import React from 'react';
import { Lightbulb, Power, Thermometer, Lock, Tv, Music, Moon, Sun, Wind, Play, Pause, Volume2, Blinds, Footprints, Radio, Smartphone, Circle, Bell, DoorOpen, Droplets, Cpu, SunDim, Palette } from 'lucide-react';
import { DeviceType } from '../types';

export const getIconForDevice = (type: DeviceType, isActive: boolean) => {
  const props = {
    size: 24,
    className: `transition-all duration-300 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/40'}`
  };

  switch (type) {
    case DeviceType.LIGHT:
    case DeviceType.DIMMER:
      return <Lightbulb {...props} />;
    case DeviceType.SWITCH:
      return <Power {...props} />;
    case DeviceType.THERMOSTAT:
      return <Thermometer {...props} />;
    case DeviceType.AC:
      return <Wind {...props} />;
    case DeviceType.BLIND:
      return <Blinds {...props} />;
    case DeviceType.LOCK:
      return <Lock {...props} />;
    case DeviceType.MEDIA:
    case DeviceType.TV:
    case DeviceType.AVR:
      return <Tv {...props} />;
    case DeviceType.SCENE:
      return <Play {...props} />;
    case DeviceType.MOTION:
      return <Footprints {...props} />;
    case DeviceType.PRESENCE:
      return <Radio {...props} />;
    case DeviceType.IR_REMOTE:
      return <Smartphone {...props} />;
    case DeviceType.BUTTON:
      return <Circle {...props} />;
    // ═══ NOVOS TIPOS v1.6.1 ═══════════════════════════════════════════════════
    case DeviceType.SIREN:
      return <Bell {...props} className={`transition-all duration-300 ${isActive ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] animate-pulse' : 'text-white/40'}`} />;
    case DeviceType.CONTACT:
      return <DoorOpen {...props} className={`transition-all duration-300 ${isActive ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-green-400'}`} />;
    case DeviceType.TEMPERATURE:
      return <Thermometer {...props} className={`transition-all duration-300 ${isActive ? 'text-cyan-400' : 'text-white/40'}`} />;
    case DeviceType.HUMIDITY:
      return <Droplets {...props} className={`transition-all duration-300 ${isActive ? 'text-blue-400' : 'text-white/40'}`} />;
    case DeviceType.MATTER_SENSOR:
      return <Cpu {...props} className={`transition-all duration-300 ${isActive ? 'text-purple-400' : 'text-white/40'}`} />;
    case DeviceType.ILLUMINANCE:
      return <SunDim {...props} className={`transition-all duration-300 ${isActive ? 'text-yellow-400' : 'text-white/40'}`} />;
    case DeviceType.RGB_CCT:
      return <Palette {...props} className={`transition-all duration-300 ${isActive ? 'text-pink-400' : 'text-white/40'}`} />;
    // ═══════════════════════════════════════════════════════════════════════════
    default:
      return <Power {...props} />;
  }
};
