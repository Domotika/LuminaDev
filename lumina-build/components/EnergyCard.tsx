import React, { useState, useEffect } from 'react';
import { Device, EnergyConfig } from '../types';
import { GlassCard } from './GlassCard';
import { Zap, TrendingUp, DollarSign, Gauge, Activity } from 'lucide-react';
import { getEnergyConfig } from '../services/hubitatService';

interface EnergyCardProps {
  device: Device;
  onUpdate: (deviceId: string, newState: Partial<Device['state']>) => void;
}

export const EnergyCard: React.FC<EnergyCardProps> = ({ device, onUpdate }) => {
  const [config, setConfig] = useState<EnergyConfig>(getEnergyConfig());
  
  const power = device.state.power || 0;
  const energy = device.state.energy || 0;
  const energyToday = device.state.energyToday || 0;
  const voltage = device.state.voltage;
  const current = device.state.current;

  // Calculate cost
  const dailyCost = energyToday * config.kwhPrice;
  const monthlyCost = energy * config.kwhPrice;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: config.currency
    }).format(value);
  };

  // Power level indicator (0-5000W typical home)
  const powerLevel = Math.min(100, (power / 5000) * 100);
  const getPowerColor = () => {
    if (powerLevel < 30) return 'text-green-400';
    if (powerLevel < 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <GlassCard className="relative overflow-hidden h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full bg-yellow-500/20 ${getPowerColor()}`}>
            <Zap size={16} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">{device.name}</h3>
            <p className="text-[10px] text-white/50">Medidor de Energia</p>
          </div>
        </div>
      </div>

      {/* Main Power Display */}
      <div className="text-center mb-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-4xl font-light ${getPowerColor()}`}>
            {power.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-sm text-white/50">W</span>
        </div>
        <p className="text-[10px] text-white/40 mt-1">Consumo Instantâneo</p>
        
        {/* Power Bar */}
        <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              powerLevel < 30 ? 'bg-green-500' : 
              powerLevel < 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${powerLevel}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Today's consumption */}
        <div className="bg-white/5 rounded-lg p-2">
          <div className="flex items-center gap-1 text-white/50 mb-1">
            <Activity size={10} />
            <span className="text-[9px]">Hoje</span>
          </div>
          <span className="text-sm font-medium text-white">
            {energyToday.toFixed(2)} kWh
          </span>
        </div>

        {/* Total consumption */}
        <div className="bg-white/5 rounded-lg p-2">
          <div className="flex items-center gap-1 text-white/50 mb-1">
            <TrendingUp size={10} />
            <span className="text-[9px]">Total</span>
          </div>
          <span className="text-sm font-medium text-white">
            {energy.toFixed(1)} kWh
          </span>
        </div>

        {/* Voltage (if available) */}
        {voltage !== undefined && (
          <div className="bg-white/5 rounded-lg p-2">
            <div className="flex items-center gap-1 text-white/50 mb-1">
              <Gauge size={10} />
              <span className="text-[9px]">Tensão</span>
            </div>
            <span className="text-sm font-medium text-white">
              {voltage.toFixed(0)} V
            </span>
          </div>
        )}

        {/* Current (if available) */}
        {current !== undefined && (
          <div className="bg-white/5 rounded-lg p-2">
            <div className="flex items-center gap-1 text-white/50 mb-1">
              <Zap size={10} />
              <span className="text-[9px]">Corrente</span>
            </div>
            <span className="text-sm font-medium text-white">
              {current.toFixed(2)} A
            </span>
          </div>
        )}
      </div>

      {/* Cost Display (if enabled) */}
      {config.showCost && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-white/50">
              <DollarSign size={12} />
              <span className="text-[10px]">Custo Estimado (Hoje)</span>
            </div>
            <span className="text-sm font-medium text-green-400">
              {formatCurrency(dailyCost)}
            </span>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default EnergyCard;
