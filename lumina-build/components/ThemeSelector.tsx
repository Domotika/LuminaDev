// ═══════════════════════════════════════════════════════════════════════════
//  THEME SELECTOR - Lumina Dashboard Theme Selection (Inline Component)
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { THEMES, applyTheme } from '../themes';

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const handleSelect = (themeId: string) => {
    applyTheme(themeId);
    onThemeChange(themeId);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => handleSelect(theme.id)}
          className={`p-4 rounded-xl border transition-all text-left ${
            currentTheme === theme.id
              ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/50'
              : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: theme.colors.primary }}
            />
            <p className="font-medium text-white text-sm">{theme.name}</p>
          </div>
          <p className="text-xs text-white/60">{theme.description}</p>
        </button>
      ))}
    </div>
  );
};
