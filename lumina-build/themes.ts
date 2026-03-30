// ═══════════════════════════════════════════════════════════════════════════
//  THEMES - Lumina Dashboard Theme System
// ═══════════════════════════════════════════════════════════════════════════

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  cardStyle: 'glass' | 'solid' | 'gradient';
  borderRadius: string;
}

export const THEMES: Theme[] = [
  {
    id: 'highline',
    name: 'Highline',
    description: 'Elegante e minimalista',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#06B6D4',
      background: '#000000',
      surface: 'rgba(255, 255, 255, 0.1)',
      text: '#FFFFFF',
      textMuted: '#9CA3AF',
    },
    cardStyle: 'glass',
    borderRadius: '1rem',
  },
  {
    id: 'crystalline',
    name: 'Crystalline',
    description: 'Claro e cristalino',
    colors: {
      primary: '#0EA5E9',
      secondary: '#6366F1',
      accent: '#14B8A6',
      background: '#0F172A',
      surface: 'rgba(255, 255, 255, 0.05)',
      text: '#F1F5F9',
      textMuted: '#64748B',
    },
    cardStyle: 'glass',
    borderRadius: '1.5rem',
  },
  {
    id: 'nexus-amber',
    name: 'Nexus Amber',
    description: 'Quente e acolhedor',
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      accent: '#F97316',
      background: '#18181B',
      surface: 'rgba(245, 158, 11, 0.1)',
      text: '#FAFAFA',
      textMuted: '#A1A1AA',
    },
    cardStyle: 'glass',
    borderRadius: '1rem',
  },
  {
    id: 'nexus-blue',
    name: 'Nexus Blue',
    description: 'Moderno e tecnológico',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#06B6D4',
      background: '#0C0A09',
      surface: 'rgba(59, 130, 246, 0.1)',
      text: '#FAFAF9',
      textMuted: '#A8A29E',
    },
    cardStyle: 'glass',
    borderRadius: '0.75rem',
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

export function initTheme(): void {
  const saved = localStorage.getItem('lumina-theme');
  if (saved) {
    applyTheme(saved);
  }
}

export function loadSavedTheme(): string {
  return localStorage.getItem('lumina-theme') || 'highline';
}

export function applyTheme(themeId: string): void {
  localStorage.setItem('lumina-theme', themeId);
  const theme = getTheme(themeId);
  const root = document.documentElement;
  
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
}
