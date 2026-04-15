import React, { useState } from 'react';
import { Device, HubitatCommand } from '../types';
import { Bell, BellRing, Volume2, VolumeX, AlertTriangle, Play, Square, Sun, Battery } from 'lucide-react';

interface SirenCardProps {
  device: Device;
  onCommand: (command: HubitatCommand) => void;
  className?: string;
}

/**
 * SirenCard - Card para Tuya Smart Siren Zigbee (driver kkossev)
 * 
 * Capabilities suportadas:
 * - Alarm (strobe, off, both, siren)
 * - Tone (beep)
 * - Chime (playSound, stop)
 * - AudioVolume (volume, mute)
 * - TemperatureMeasurement (modelos NEO)
 * - RelativeHumidityMeasurement (modelos NEO)
 * - Battery
 */
export const SirenCard: React.FC<SirenCardProps> = ({ device, onCommand, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const state = device.state || {};
  const isActive = state.isOn || state.alarm === 'siren' || state.alarm === 'both' || state.chimeStatus === 'playing';
  const battery = state.battery;
  const temperature = state.temperature;
  const humidity = state.humidity;
  const solarCharging = state.solarCharging;
  const volume = state.volume || state.level || 50;
  const soundName = state.soundName || 'Default';
  const alarmState = state.alarmState || 'No Alarm';
  
  // Comandos
  const handleSiren = () => onCommand({ deviceId: device.hubitatId, command: 'siren' });
  const handleBoth = () => onCommand({ deviceId: device.hubitatId, command: 'both' });
  const handleStrobe = () => onCommand({ deviceId: device.hubitatId, command: 'strobe' });
  const handleOff = () => onCommand({ deviceId: device.hubitatId, command: 'off' });
  const handleBeep = () => onCommand({ deviceId: device.hubitatId, command: 'beep' });
  const handleStop = () => onCommand({ deviceId: device.hubitatId, command: 'stop' });
  
  const handlePlaySound = (soundNumber: number) => {
    onCommand({ deviceId: device.hubitatId, command: 'playSound', arguments: [soundNumber] });
  };
  
  const handleSetVolume = (level: number) => {
    onCommand({ deviceId: device.hubitatId, command: 'setVolume', arguments: [level] });
  };

  return (
    <div 
      className={`relative rounded-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden ${className}`}
      style={{
        background: isActive 
          ? 'linear-gradient(135deg, rgba(239,68,68,0.25) 0%, rgba(220,38,38,0.15) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        border: isActive ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: isActive ? '0 0 30px rgba(239,68,68,0.3)' : 'none'
      }}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isActive ? 'bg-red-500/30 animate-pulse' : 'bg-white/10'}`}>
              {isActive ? (
                <BellRing className="w-6 h-6 text-red-400" />
              ) : (
                <Bell className="w-6 h-6 text-white/70" />
              )}
            </div>
            <div>
              <h3 className="text-white font-medium text-sm truncate max-w-[120px]">
                {device.name}
              </h3>
              <p className="text-white/50 text-xs">
                {isActive ? alarmState : 'Inativo'}
              </p>
            </div>
          </div>
          
          {/* Status Icons */}
          <div className="flex items-center gap-2">
            {solarCharging === 'charging' && (
              <Sun className="w-4 h-4 text-yellow-400" />
            )}
            {battery !== undefined && (
              <div className="flex items-center gap-1">
                <Battery className={`w-4 h-4 ${battery < 20 ? 'text-red-400' : 'text-green-400'}`} />
                <span className="text-xs text-white/60">{battery}%</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Temperature/Humidity (NEO models) */}
        {(temperature !== undefined || humidity !== undefined) && (
          <div className="flex gap-4 mt-3 text-xs text-white/60">
            {temperature !== undefined && (
              <span>🌡️ {temperature}°C</span>
            )}
            {humidity !== undefined && (
              <span>💧 {humidity}%</span>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions (sempre visível) */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleSiren(); }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 transition-colors"
          >
            <BellRing className="w-5 h-5 text-red-400" />
            <span className="text-[10px] text-white/70">Sirene</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleBeep(); }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/40 transition-colors"
          >
            <Bell className="w-5 h-5 text-yellow-400" />
            <span className="text-[10px] text-white/70">Beep</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); isActive ? handleOff() : handleStop(); }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Square className="w-5 h-5 text-white/70" />
            <span className="text-[10px] text-white/70">Parar</span>
          </button>
        </div>
      </div>

      {/* Expanded Controls */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-4">
          {/* Alarm Modes */}
          <div>
            <p className="text-xs text-white/50 mb-2">Modos de Alarme</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleBoth()}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-xs text-white/80"
              >
                Som + Luz
              </button>
              <button
                onClick={() => handleStrobe()}
                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-xs text-white/80"
              >
                Apenas Luz
              </button>
            </div>
          </div>
          
          {/* Volume Control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-white/50">Volume</p>
              <span className="text-xs text-white/70">{volume}%</span>
            </div>
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-white/40" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => handleSetVolume(parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-cyan-400 
                  [&::-webkit-slider-thumb]:rounded-full"
              />
              <Volume2 className="w-4 h-4 text-white/40" />
            </div>
          </div>
          
          {/* Melodias (1-18) */}
          <div>
            <p className="text-xs text-white/50 mb-2">Melodias</p>
            <div className="grid grid-cols-6 gap-1">
              {[...Array(18)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePlaySound(i + 1)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-cyan-500/30 text-xs text-white/70 transition-colors"
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          
          {/* Current Sound */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Melodia atual:</span>
            <span className="text-cyan-400">{soundName}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SirenCard;
