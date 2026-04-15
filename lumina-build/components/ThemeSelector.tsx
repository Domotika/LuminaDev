/**
 * ThemeSelector - Componente para selecionar tema do Lumina
 */

import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { THEMES, getTheme, applyTheme, LuminaTheme } from '../themes';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export const ThemeSelector = ({ currentTheme, onThemeChange }: ThemeSelectorProps) => {
  const themes = Object.values(THEMES);
  
  const handleSelect = (themeId: string) => {
    const theme = getTheme(themeId);
    applyTheme(theme);
    onThemeChange(themeId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
        <Palette size={14} />
        <span>Tema Visual</span>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={currentTheme === theme.id}
            onSelect={() => handleSelect(theme.id)}
          />
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// Theme Card Preview
// ─────────────────────────────────────────────────────────────────────────

interface ThemeCardProps {
  theme: LuminaTheme;
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeCard = ({ theme, isSelected, onSelect }: ThemeCardProps) => {
  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full p-3 rounded-xl text-left transition-all
        ${isSelected 
          ? 'ring-2 ring-offset-2 ring-offset-black' 
          : 'hover:bg-white/5'
        }
      `}
      style={{
        background: theme.effects.glass,
        borderColor: theme.effects.glassBorder,
        borderWidth: '1px',
        borderStyle: 'solid',
        // Ring color based on theme primary
        ...(isSelected ? { '--tw-ring-color': theme.colors.primary } as any : {}),
      }}
    >
      {/* Color Preview Dots */}
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-4 h-4 rounded-full border border-white/20"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-white/20"
          style={{ backgroundColor: theme.colors.secondary }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-white/20"
          style={{ backgroundColor: theme.colors.accent }}
        />
        
        {/* Selected Check */}
        {isSelected && (
          <div className="ml-auto">
            <Check size={16} style={{ color: theme.colors.primary }} />
          </div>
        )}
      </div>
      
      {/* Theme Info */}
      <div>
        <p className="font-medium text-white text-sm">{theme.name}</p>
        <p className="text-[10px] text-white/50 mt-0.5">{theme.description}</p>
      </div>
      
      {/* Mini Preview Bar */}
      <div 
        className="mt-2 h-1 rounded-full overflow-hidden flex"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="h-full w-1/3" style={{ backgroundColor: theme.colors.primary }} />
        <div className="h-full w-1/3" style={{ backgroundColor: theme.colors.secondary }} />
        <div className="h-full w-1/3" style={{ backgroundColor: theme.colors.accent }} />
      </div>
    </button>
  );
};

export default ThemeSelector;
