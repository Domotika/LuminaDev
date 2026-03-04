import { useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Wifi, Bluetooth, Radio, Tv, Usb, Disc, Speaker,
  Shuffle, Repeat, Repeat1, ChevronUp, ChevronDown,
  Music, Settings, X
} from 'lucide-react';
import { Device } from '../types';
import { sendHubitatCommand } from '../services/hubitatService';

interface SoundSmartCardProps {
  device: Device;
  onUpdate: (deviceId: string, updates: Partial<Device['state']>) => void;
  compact?: boolean;
}

// Input icons mapping
const INPUT_ICONS: Record<string, any> = {
  'WiFi': Wifi,
  'Radio Online': Radio,
  'Spotify': Music,
  'Bluetooth': Bluetooth,
  'Óptico': Disc,
  'HDMI': Tv,
  'USB': Usb,
  'Line In': Speaker,
  'Airplay': Wifi,
};

// Input commands mapping
const INPUT_COMMANDS: Record<string, string> = {
  'wifi': 'inputwifi',
  'optical': 'inputoptical',
  'bluetooth': 'inputbluetooth',
  'aux': 'inputaux',
  'usb': 'inputusb',
  'hdmi': 'inputhdmi',
};

export const SoundSmartCardCompact = ({ device, onUpdate }: SoundSmartCardProps) => {
  const status = device.state.status || 'stopped';
  const volume = device.state.volume || device.state.level || 0;
  const input = device.state.input || '--';
  const isMuted = device.state.mute === 'muted';
  const isPlaying = status === 'playing';
  
  const sendCmd = async (cmd: string, args?: any[]) => {
    await sendHubitatCommand(device.hubitatId, cmd, args);
  };

  const togglePlay = () => {
    sendCmd(isPlaying ? 'pause' : 'play');
    onUpdate(device.id, { status: isPlaying ? 'paused' : 'playing' });
  };

  const adjustVolume = (delta: number) => {
    const newVol = Math.max(0, Math.min(100, volume + delta));
    sendCmd('setVolume', [newVol]);
    onUpdate(device.id, { volume: newVol, level: newVol });
  };

  const toggleMute = () => {
    sendCmd(isMuted ? 'unmute' : 'mute');
    onUpdate(device.id, { mute: isMuted ? 'unmuted' : 'muted' });
  };

  const InputIcon = INPUT_ICONS[input] || Speaker;

  return (
    <div className="glass-card rounded-2xl p-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPlaying ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
            <Music size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-white truncate max-w-[120px]">{device.name}</p>
            <p className="text-[10px] text-white/40 flex items-center gap-1">
              <InputIcon size={10} />
              {input}
            </p>
          </div>
        </div>
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-white/20'}`} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Playback */}
        <div className="flex items-center gap-1">
          <button onClick={() => sendCmd('previousTrack')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <SkipBack size={16} className="text-white/60" />
          </button>
          <button onClick={togglePlay} className={`p-3 rounded-full transition-all ${isPlaying ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={() => sendCmd('nextTrack')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <SkipForward size={16} className="text-white/60" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1">
          <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-white/60" />}
          </button>
          <button onClick={() => adjustVolume(-5)} className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <ChevronDown size={14} className="text-white/40" />
          </button>
          <span className="text-xs font-mono text-white/60 w-8 text-center">{volume}</span>
          <button onClick={() => adjustVolume(5)} className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <ChevronUp size={14} className="text-white/40" />
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================
// COMPLETE VERSION - Full Remote Control
// =============================================

export const SoundSmartCardFull = ({ device, onUpdate }: SoundSmartCardProps) => {
  const [showInputs, setShowInputs] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  
  const status = device.state.status || 'stopped';
  const volume = device.state.volume || device.state.level || 0;
  const input = device.state.input || '--';
  const isMuted = device.state.mute === 'muted';
  const isPlaying = status === 'playing';
  const trackName = device.state.trackname || device.state.trackDescription || '';
  const coverUrl = device.state.URLLargeCoverFile || device.state.ImageLargeCover || '';
  
  const sendCmd = async (cmd: string, args?: any[]) => {
    await sendHubitatCommand(device.hubitatId, cmd, args);
  };

  const togglePlay = () => {
    sendCmd(isPlaying ? 'pause' : 'play');
    onUpdate(device.id, { status: isPlaying ? 'paused' : 'playing' });
  };

  const setVolume = (newVol: number) => {
    const vol = Math.max(0, Math.min(100, newVol));
    sendCmd('setVolume', [vol]);
    onUpdate(device.id, { volume: vol, level: vol });
  };

  const toggleMute = () => {
    sendCmd(isMuted ? 'unmute' : 'mute');
    onUpdate(device.id, { mute: isMuted ? 'unmuted' : 'muted' });
  };

  const changeInput = (inputCmd: string) => {
    sendCmd(inputCmd);
    setShowInputs(false);
  };

  const playPreset = (num: number) => {
    sendCmd(`preset${num}`);
    setShowPresets(false);
  };

  const setLoopMode = (mode: number) => {
    sendCmd('loopMode', [mode]);
  };

  const InputIcon = INPUT_ICONS[input] || Speaker;

  // Parse track info from HTML if needed
  const cleanTrackName = trackName.replace(/<[^>]*>/g, '').trim() || 'Sem música';

  return (
    <div className="glass-card rounded-3xl p-6 w-full max-w-sm mx-auto relative overflow-hidden">
      
      {/* Input Selection Overlay */}
      {showInputs && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-6 rounded-3xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold uppercase tracking-widest text-white">Entrada</span>
            <button onClick={() => setShowInputs(false)} className="p-2 hover:bg-white/10 rounded-full">
              <X size={18} className="text-white/50" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 flex-1">
            {Object.entries(INPUT_COMMANDS).map(([name, cmd]) => {
              const Icon = INPUT_ICONS[name] || Speaker;
              return (
                <button
                  key={cmd}
                  onClick={() => changeInput(cmd)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <Icon size={24} className="text-white/70" />
                  <span className="text-[10px] text-white/50 uppercase">{name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Presets Overlay */}
      {showPresets && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-6 rounded-3xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold uppercase tracking-widest text-white">Presets</span>
            <button onClick={() => setShowPresets(false)} className="p-2 hover:bg-white/10 rounded-full">
              <X size={18} className="text-white/50" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2 flex-1">
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <button
                key={num}
                onClick={() => playPreset(num)}
                className="flex items-center justify-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xl font-light text-white/70"
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPlaying ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
            <Music size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">{device.name}</h3>
            <button 
              onClick={() => setShowInputs(true)}
              className="text-xs text-white/40 flex items-center gap-1 hover:text-white/70 transition-colors"
            >
              <InputIcon size={12} />
              {input}
              <ChevronDown size={10} />
            </button>
          </div>
        </div>
        <button onClick={() => setShowPresets(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Settings size={18} className="text-white/40" />
        </button>
      </div>

      {/* Cover Art */}
      <div className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-white/10 to-white/5 mb-4 overflow-hidden flex items-center justify-center">
        {coverUrl ? (
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <Music size={64} className="text-white/20" />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Track info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-sm font-medium text-white truncate">{cleanTrackName}</p>
          <p className="text-[10px] text-white/50 uppercase tracking-wider">{status}</p>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={() => setLoopMode(2)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
          <Shuffle size={18} className="text-white/40" />
        </button>
        <button onClick={() => sendCmd('previousTrack')} className="p-3 hover:bg-white/10 rounded-full transition-colors">
          <SkipBack size={22} className="text-white/70" />
        </button>
        <button 
          onClick={togglePlay} 
          className={`p-5 rounded-full transition-all ${isPlaying ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button onClick={() => sendCmd('nextTrack')} className="p-3 hover:bg-white/10 rounded-full transition-colors">
          <SkipForward size={22} className="text-white/70" />
        </button>
        <button onClick={() => setLoopMode(0)} className="p-3 hover:bg-white/10 rounded-full transition-colors">
          <Repeat size={18} className="text-white/40" />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3">
        <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-white/50" />}
        </button>
        <div className="flex-1 relative h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-white/50 rounded-full transition-all"
            style={{ width: `${volume}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-xs font-mono text-white/50 w-8 text-right">{volume}</span>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-white/5">
        <button onClick={() => sendCmd('stop')} className="px-3 py-1.5 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-wider">
          Stop
        </button>
        <button onClick={() => setLoopMode(1)} className="px-3 py-1.5 text-[10px] text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors uppercase tracking-wider flex items-center gap-1">
          <Repeat1 size={12} /> Single
        </button>
      </div>
    </div>
  );
};

// Default export - decides which version based on compact prop
export const SoundSmartCard = ({ device, onUpdate, compact = true }: SoundSmartCardProps) => {
  if (compact) {
    return <SoundSmartCardCompact device={device} onUpdate={onUpdate} />;
  }
  return <SoundSmartCardFull device={device} onUpdate={onUpdate} />;
};

export default SoundSmartCard;
