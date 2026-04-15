import React from 'react';
import { Device } from '../types';
import { DoorOpen, DoorClosed, Thermometer, Droplets, Battery, Wifi } from 'lucide-react';

interface ContactSensorCardProps {
  device: Device;
  className?: string;
}

/**
 * ContactSensorCard - Card para sensores de contato (porta/janela)
 * 
 * Suporta:
 * - Matter Advanced Bridge sensors (Aqara, Tuya, Hue via Matter)
 * - Zigbee contact sensors
 * - Sensores com temperatura/umidade (Neo, Aqara T1, etc)
 */
export const ContactSensorCard: React.FC<ContactSensorCardProps> = ({ device, className }) => {
  const state = device.state || {};
  const isOpen = state.contact === 'open' || state.isOn;
  const battery = state.battery;
  const temperature = state.temperature;
  const humidity = state.humidity;
  
  return (
    <div 
      className={`relative rounded-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden ${className}`}
      style={{
        background: isOpen 
          ? 'linear-gradient(135deg, rgba(251,191,36,0.25) 0%, rgba(245,158,11,0.15) 100%)'
          : 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.1) 100%)',
        border: isOpen ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(34,197,94,0.3)',
        boxShadow: isOpen ? '0 0 20px rgba(251,191,36,0.2)' : 'none'
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isOpen ? 'bg-yellow-500/30' : 'bg-green-500/20'}`}>
              {isOpen ? (
                <DoorOpen className={`w-6 h-6 ${isOpen ? 'text-yellow-400' : 'text-green-400'}`} />
              ) : (
                <DoorClosed className="w-6 h-6 text-green-400" />
              )}
            </div>
            <div>
              <h3 className="text-white font-medium text-sm truncate max-w-[120px]">
                {device.name}
              </h3>
              <p className={`text-xs ${isOpen ? 'text-yellow-400' : 'text-green-400'}`}>
                {isOpen ? 'Aberto' : 'Fechado'}
              </p>
            </div>
          </div>
          
          {/* Battery */}
          {battery !== undefined && (
            <div className="flex items-center gap-1">
              <Battery className={`w-4 h-4 ${battery < 20 ? 'text-red-400' : 'text-green-400'}`} />
              <span className="text-xs text-white/60">{battery}%</span>
            </div>
          )}
        </div>
        
        {/* Status Visual */}
        <div className={`h-1 rounded-full mb-3 ${isOpen ? 'bg-yellow-500/50' : 'bg-green-500/50'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isOpen ? 'bg-yellow-400 w-full' : 'bg-green-400 w-0'}`}
          />
        </div>
        
        {/* Additional Sensors */}
        {(temperature !== undefined || humidity !== undefined) && (
          <div className="flex gap-4 text-xs text-white/60 border-t border-white/10 pt-3">
            {temperature !== undefined && (
              <div className="flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-orange-400" />
                <span>{temperature}°C</span>
              </div>
            )}
            {humidity !== undefined && (
              <div className="flex items-center gap-1">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span>{humidity}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSensorCard;
