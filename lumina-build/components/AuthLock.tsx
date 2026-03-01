import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Lock, Unlock, ChevronRight, AlertCircle } from 'lucide-react';

interface AuthLockProps {
  onUnlock: () => void;
}

export const AuthLock: React.FC<AuthLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lumina_auth_pin');
    if (saved) {
      setStoredPin(saved);
      setIsSetupMode(false);
    } else {
      setIsSetupMode(true);
    }
  }, []);

  const handleNumberClick = (num: number) => {
    if (pin.length < 6) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleSubmit = () => {
    if (isSetupMode) {
      if (pin.length < 4) {
        setError(true);
        return;
      }
      localStorage.setItem('lumina_auth_pin', pin);
      setStoredPin(pin);
      setIsSetupMode(false);
      onUnlock(); // Auto unlock on setup
    } else {
      if (pin === storedPin) {
        onUnlock();
      } else {
        setError(true);
        setPin('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 blur-sm" />
      <div className="absolute inset-0 bg-black/60" />

      <GlassCard className="w-full max-w-sm p-8 flex flex-col items-center gap-6 relative z-10 bg-black/40 border-white/10 backdrop-blur-xl">
        <div className="flex flex-col items-center gap-2 mb-2">
            <div className={`p-4 rounded-full border ${error ? 'border-red-500/50 bg-red-500/10 text-red-200' : 'border-white/10 bg-white/5 text-blue-300'} transition-all duration-300`}>
                {error ? <AlertCircle size={32} /> : isSetupMode ? <Lock size={32} /> : <Lock size={32} />}
            </div>
            <h2 className="text-xl font-light text-white tracking-widest uppercase">
                {isSetupMode ? 'Criar Senha' : 'Lumina Lock'}
            </h2>
            <p className="text-xs text-white/50 text-center">
                {error 
                    ? 'Senha incorreta. Tente novamente.' 
                    : isSetupMode 
                        ? 'Defina um PIN para proteger o painel' 
                        : 'Digite seu PIN para acessar'}
            </p>
        </div>

        {/* PIN Dots Display */}
        <div className="flex gap-3 h-4 mb-2">
            {[...Array(isSetupMode ? 6 : 6)].map((_, i) => (
                <div 
                    key={i} 
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i < pin.length 
                            ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)] scale-110' 
                            : 'bg-white/10'
                    }`}
                />
            ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[240px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    className="h-16 w-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xl font-light text-white transition-all active:scale-95 flex items-center justify-center"
                >
                    {num}
                </button>
            ))}
            <button 
                onClick={handleClear}
                className="h-16 w-16 rounded-full text-xs text-white/40 font-medium hover:text-white transition-colors flex items-center justify-center"
            >
                LIMPAR
            </button>
            <button
                onClick={() => handleNumberClick(0)}
                className="h-16 w-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xl font-light text-white transition-all active:scale-95 flex items-center justify-center"
            >
                0
            </button>
            <button 
                onClick={handleSubmit}
                disabled={pin.length === 0}
                className={`h-16 w-16 rounded-full border flex items-center justify-center transition-all active:scale-95 ${
                    pin.length > 0 
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-200 hover:bg-blue-500/30' 
                        : 'bg-transparent border-transparent text-white/10'
                }`}
            >
                <ChevronRight size={24} />
            </button>
        </div>
      </GlassCard>
    </div>
  );
};