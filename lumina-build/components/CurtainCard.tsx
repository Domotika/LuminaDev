/**
 * CurtainCard.tsx - Controle de Cortinas RF (MolSmart GW3)
 * 
 * Comandos suportados:
 * - Up / Down / Stop (botões)
 * - setPosition (slider 0-100%)
 * - open / close (atalhos)
 * 
 * Atributos lidos:
 * - position (0-100)
 * - moving ("up" | "down" | "stopped")
 * - windowShade ("open" | "closed" | "partially open" | "opening" | "closing")
 */

import React, { useState, useEffect } from 'react';

interface CurtainCardProps {
  device: {
    id: string;
    label: string;
    attributes?: {
      position?: number;
      moving?: string;
      windowShade?: string;
    };
  };
  onCommand: (deviceId: string, command: string, args?: any) => void;
  compact?: boolean;
}

export const CurtainCard: React.FC<CurtainCardProps> = ({ device, onCommand, compact = false }) => {
  const position = device.attributes?.position ?? 0;
  const moving = device.attributes?.moving ?? 'stopped';
  const shade = device.attributes?.windowShade ?? 'closed';
  
  const [sliderValue, setSliderValue] = useState(position);
  const [isDragging, setIsDragging] = useState(false);

  // Sync slider with actual position when not dragging
  useEffect(() => {
    if (!isDragging) {
      setSliderValue(position);
    }
  }, [position, isDragging]);

  const handleUp = () => onCommand(device.id, 'Up');
  const handleStop = () => onCommand(device.id, 'Stop');
  const handleDown = () => onCommand(device.id, 'Down');

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(parseInt(e.target.value));
  };

  const handleSliderRelease = () => {
    setIsDragging(false);
    if (sliderValue !== position) {
      onCommand(device.id, 'setPosition', { value1: sliderValue });
    }
  };

  // Status indicator
  const getStatusColor = () => {
    if (moving === 'up') return 'text-green-400';
    if (moving === 'down') return 'text-orange-400';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (moving === 'up') return 'Subindo...';
    if (moving === 'down') return 'Descendo...';
    if (shade === 'open') return 'Aberta';
    if (shade === 'closed') return 'Fechada';
    return `${position}%`;
  };

  // Compact version - just 3 buttons inline
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 truncate flex-1">{device.label}</span>
        <div className="flex gap-1">
          <button
            onClick={handleUp}
            className={`p-2 rounded-lg transition-all ${
              moving === 'up' 
                ? 'bg-green-500/30 text-green-400' 
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
            title="Subir"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={handleStop}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-all"
            title="Parar"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
          <button
            onClick={handleDown}
            className={`p-2 rounded-lg transition-all ${
              moving === 'down' 
                ? 'bg-orange-500/30 text-orange-400' 
                : 'bg-white/5 hover:bg-white/10 text-gray-300'
            }`}
            title="Descer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <span className={`text-xs ${getStatusColor()} min-w-[40px] text-right`}>
          {position}%
        </span>
      </div>
    );
  }

  // Full version - with slider and visual indicator
  return (
    <div className="glass-card p-4 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${shade === 'closed' ? 'bg-gray-600' : 'bg-blue-500/20'}`}>
            <svg className="w-5 h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M4 4h16v2H4V4zm0 4h16v2H4V8zm0 4h16v2H4v-2zm0 4h16v2H4v-2zm0 4h16v2H4v-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium text-sm truncate max-w-[150px]">{device.label}</h3>
            <p className={`text-xs ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>
      </div>

      {/* Visual indicator - curtain graphic */}
      <div className="relative h-24 mb-4 bg-black/30 rounded-lg overflow-hidden">
        {/* Curtain rail */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gray-700 rounded-t-lg" />
        
        {/* Curtain fabric - height based on position (100% = fully up/open) */}
        <div 
          className="absolute top-3 left-1 right-1 bg-gradient-to-b from-gray-500 to-gray-600 transition-all duration-300"
          style={{ height: `${100 - position}%` }}
        >
          {/* Curtain folds */}
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="absolute left-0 right-0 h-px bg-gray-400/30"
              style={{ top: `${20 * (i + 1)}%` }}
            />
          ))}
        </div>

        {/* Position label */}
        <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
          {position}%
        </div>

        {/* Moving indicator */}
        {moving !== 'stopped' && (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            ${moving === 'up' ? 'text-green-400' : 'text-orange-400'} animate-pulse`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {moving === 'up' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </div>
        )}
      </div>

      {/* Slider */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={handleSliderRelease}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={handleSliderRelease}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-lg"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Fechada</span>
          <span>Aberta</span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleUp}
          className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
            moving === 'up'
              ? 'bg-green-500/30 text-green-400 ring-1 ring-green-500/50'
              : 'bg-white/5 hover:bg-white/10 text-gray-300'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <span className="text-xs mt-1">Subir</span>
        </button>

        <button
          onClick={handleStop}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          <span className="text-xs mt-1">Parar</span>
        </button>

        <button
          onClick={handleDown}
          className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
            moving === 'down'
              ? 'bg-orange-500/30 text-orange-400 ring-1 ring-orange-500/50'
              : 'bg-white/5 hover:bg-white/10 text-gray-300'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-xs mt-1">Descer</span>
        </button>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onCommand(device.id, 'close')}
          className="flex-1 py-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
        >
          0%
        </button>
        <button
          onClick={() => onCommand(device.id, 'setPosition', { value1: 25 })}
          className="flex-1 py-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
        >
          25%
        </button>
        <button
          onClick={() => onCommand(device.id, 'setPosition', { value1: 50 })}
          className="flex-1 py-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
        >
          50%
        </button>
        <button
          onClick={() => onCommand(device.id, 'setPosition', { value1: 75 })}
          className="flex-1 py-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
        >
          75%
        </button>
        <button
          onClick={() => onCommand(device.id, 'open')}
          className="flex-1 py-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all"
        >
          100%
        </button>
      </div>
    </div>
  );
};

export default CurtainCard;
