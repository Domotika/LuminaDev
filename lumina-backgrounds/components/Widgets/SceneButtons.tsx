import React, { useState } from 'react';
import { Settings, SceneUrls } from '../../types';

interface SceneButtonsProps {
  settings: Settings;
}

export const SceneButtons: React.FC<SceneButtonsProps> = ({ settings }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSceneClick = async (url: string, name: string, key: string) => {
    if (!url) {
      // Optional: Visual feedback if no URL is set, or just do nothing
      return;
    }

    setLoading(key);
    try {
      await fetch(url, { mode: 'no-cors' });
      // Short delay to show loading state
      setTimeout(() => setLoading(null), 500);
      console.log(`Scene ${name} triggered`);
    } catch (error) {
      console.error(`Error triggering scene ${name}:`, error);
      setLoading(null);
    }
  };

  const buttons = [
    {
      key: 'movie' as keyof SceneUrls,
      label: 'Filme',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      key: 'sleep' as keyof SceneUrls,
      label: 'Dormir',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      key: 'wake' as keyof SceneUrls,
      label: 'Acordar',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      key: 'leave' as keyof SceneUrls,
      label: 'Saindo',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-3 w-full pt-4">
      {buttons.map((btn) => {
        const url = settings.sceneUrls[btn.key];
        const isLoading = loading === btn.key;
        const isDisabled = !url;

        return (
            <button 
                key={btn.key}
                onClick={() => handleSceneClick(url, btn.label, btn.key)}
                disabled={isDisabled}
                className={`
                    group relative
                    flex flex-col items-center justify-center gap-2
                    h-28 w-full rounded-2xl
                    overflow-hidden
                    transition-all duration-300 ease-out
                    backdrop-blur-xl 
                    ring-1 ring-white/10
                    shadow-lg
                    ${isLoading ? 'scale-95 bg-white/20 animate-pulse' : 'hover:scale-105 active:scale-95'}
                    ${isDisabled 
                        ? 'bg-white/5 opacity-50 cursor-not-allowed border-dashed border-white/20' 
                        : 'bg-white/10 hover:bg-white/20 hover:shadow-white/10'
                    }
                `}
                title={isDisabled ? "Configure a URL em Ajustes" : btn.label}
            >
                <div className={`text-white transition-transform duration-300 ${isDisabled ? '' : 'group-hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'}`}>
                    {btn.icon}
                </div>
                <span className="text-sm font-medium tracking-wide text-white/90 drop-shadow-md">
                    {btn.label}
                </span>

                {/* Loading Dot */}
                {isLoading && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-ping shadow-[0_0_5px_#4ade80]"></div>
                )}
            </button>
        );
      })}
    </div>
  );
};