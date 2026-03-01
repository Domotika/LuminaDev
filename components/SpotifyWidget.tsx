import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { 
    getSpotifyClientId, saveSpotifyClientId, getAuthUrl, 
    getToken, getPlayerState, playPause, nextTrack, prevTrack, 
    SpotifyState, logoutSpotify 
} from '../services/spotifyService';
import { Play, Pause, SkipBack, SkipForward, Music, Settings, LogIn, LogOut, User } from 'lucide-react';

export const SpotifyWidget: React.FC = () => {
    const [token, setToken] = useState<string | null>(getToken());
    const [clientId, setClientId] = useState(getSpotifyClientId() || '');
    const [playerState, setPlayerState] = useState<SpotifyState | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial check and Polling
    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            const data = await getPlayerState();
            setPlayerState(data);
            if (!getToken()) setToken(null); // Handle expiry logout
        };

        fetchData(); // Immediate
        const interval = setInterval(fetchData, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, [token]);

    const handleLogin = () => {
        if (!clientId) {
            alert('Por favor, insira o Client ID nas configurações primeiro.');
            setShowSettings(true);
            return;
        }
        window.location.href = getAuthUrl(clientId);
    };

    const handleSaveSettings = () => {
        saveSpotifyClientId(clientId);
        setShowSettings(false);
    };

    const handlePlayPause = async () => {
        if (!playerState) return;
        // Optimistic update
        setPlayerState(prev => prev ? ({ ...prev, is_playing: !prev.is_playing }) : null);
        await playPause(playerState.is_playing);
        setTimeout(async () => {
             const data = await getPlayerState();
             setPlayerState(data);
        }, 500);
    };

    const handleLogout = () => {
        logoutSpotify();
        setToken(null);
        setPlayerState(null);
    };

    // --- RENDER STATES ---

    // 1. Settings Mode
    if (showSettings) {
        return (
            <GlassCard className="w-full max-w-md mx-auto p-6 flex flex-col gap-4 relative">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-light flex items-center gap-2"><Music size={18} /> Configurar Spotify</h3>
                    <button onClick={() => setShowSettings(false)}><Settings size={18} className="text-white/50" /></button>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-white/50">Spotify Client ID</label>
                    <input 
                        type="text" 
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Cole seu Client ID aqui"
                        className="bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs focus:outline-none focus:border-green-500/50"
                    />
                    <p className="text-[10px] text-white/30">
                        Obtenha em developer.spotify.com. Adicione <strong>{window.location.origin}/</strong> nos Redirect URIs.
                    </p>
                </div>
                <button 
                    onClick={handleSaveSettings}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg text-xs uppercase tracking-wider transition-colors"
                >
                    Salvar
                </button>
            </GlassCard>
        );
    }

    // 2. Not Logged In
    if (!token) {
        return (
            <GlassCard className="w-full max-w-md mx-auto p-8 flex flex-col items-center gap-6 text-center relative overflow-hidden group">
                 {/* Decorative BG */}
                 <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-black z-0" />
                 
                 <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] mb-2">
                        <Music size={32} className="text-black ml-1" />
                    </div>
                    <div>
                        <h2 className="text-xl font-medium">Spotify Connect</h2>
                        <p className="text-white/50 text-xs mt-1 max-w-[200px]">Controle sua música diretamente pelo dashboard.</p>
                    </div>
                    <div className="flex gap-2 w-full mt-2">
                        <button 
                            onClick={handleLogin}
                            className="flex-1 bg-white text-black font-bold py-3 rounded-full text-xs uppercase tracking-widest hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                        >
                            <LogIn size={14} /> Conectar
                        </button>
                        <button 
                            onClick={() => setShowSettings(true)}
                            className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                            <Settings size={16} />
                        </button>
                    </div>
                 </div>
            </GlassCard>
        );
    }

    // 3. Player UI
    const track = playerState?.item;
    const isPlaying = playerState?.is_playing ?? false;
    const albumArt = track?.album.images[0]?.url;

    return (
        <GlassCard className="w-full max-w-lg mx-auto overflow-hidden relative min-h-[220px]">
            {/* Blurry Background */}
            {albumArt && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-110 transition-all duration-1000"
                    style={{ backgroundImage: `url(${albumArt})` }}
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="relative z-10 p-6 flex gap-6 items-center">
                {/* Album Art */}
                <div className="w-32 h-32 flex-shrink-0 rounded-lg shadow-2xl overflow-hidden border border-white/10 bg-white/5 relative group">
                    {albumArt ? (
                        <img src={albumArt} alt="Album" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Music size={32} className="text-white/20" />
                        </div>
                    )}
                    {/* Settings Trigger (Hidden on hover) */}
                    <button 
                        onClick={() => setShowSettings(true)} 
                        className="absolute top-2 left-2 p-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white"
                    >
                        <Settings size={12} />
                    </button>
                    {/* Logout Trigger */}
                     <button 
                        onClick={handleLogout} 
                        className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-red-500"
                        title="Desconectar"
                    >
                        <LogOut size={12} />
                    </button>
                </div>

                {/* Info & Controls */}
                <div className="flex-1 min-w-0 flex flex-col justify-center h-32">
                    <div className="mb-1">
                        {track ? (
                            <>
                                <h3 className="text-lg font-bold text-white leading-tight truncate drop-shadow-md">{track.name}</h3>
                                <p className="text-sm text-white/70 truncate drop-shadow-md">{track.artists.map(a => a.name).join(', ')}</p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-bold text-white/50">Nada tocando</h3>
                                <p className="text-sm text-white/30">Abra o Spotify em um dispositivo</p>
                            </>
                        )}
                    </div>

                    {playerState?.device && (
                        <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-medium uppercase tracking-wider mb-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            {playerState.device.name}
                        </div>
                    )}

                    {/* Progress Bar (Visual Only for MVP) */}
                    {track && (
                        <div className="w-full h-1 bg-white/10 rounded-full mb-4 overflow-hidden">
                            <div 
                                className="h-full bg-white/80 rounded-full" 
                                style={{ width: `${(playerState.progress_ms / track.duration_ms) * 100}%` }}
                            />
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button onClick={prevTrack} className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                            <SkipBack size={20} fill="currentColor" />
                        </button>
                        
                        <button 
                            onClick={handlePlayPause}
                            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-white/10"
                        >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" ml-1 />}
                        </button>
                        
                        <button onClick={nextTrack} className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                            <SkipForward size={20} fill="currentColor" />
                        </button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};