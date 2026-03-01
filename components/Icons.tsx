
import React from 'react';
import { Lightbulb, Power, Thermometer, Lock, Tv, Music, Moon, Sun, Wind, Play, Pause, Volume2, Blinds, Footprints, Radio } from 'lucide-react';
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
    default:
      return <Power {...props} />;
  }
};
