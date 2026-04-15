/**
 * Lumina Dashboard - Theme System v2.0
 * 
 * ⚠️ REGRA BLINDADA: Highline é o tema base ORIGINAL - NUNCA modificar!
 * Os outros temas aplicam CSS variables por cima.
 * 
 * TEMAS OFICIAIS LUMINA PRO:
 * 1. Highline - Glassmorphism original (PADRÃO/BLINDADO)
 * 2. Lumina Crystalline - Light mode, claridade, elegância
 * 3. Nexus Ambar - Dark + dourado, cinema, luxury
 * 4. Nexus Blue - Simples, intuitivo, idosos/hóspedes
 * 5. SmartHome Pro - Analytics, power user, sidebar
 * 6. Lumina Cinematic - Cybernetic Noir, cyan vibrante (NOVO!)
 * 7. Emerald Kinetic - Technical, verde esmeralda, data-dense (NOVO!)
 */

export type LayoutType = 'default' | 'sidebar' | 'bento';

export interface LuminaTheme {
  id: string;
  name: string;
  description: string;
  tags: string[];
  layout: LayoutType;
  preview?: string;
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    surfaceHover: string;
    surfaceHighest: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  effects: {
    glass: string;
    glassHover: string;
    glassBorder: string;
    blur: string;
    shadow: string;
    shadowHover: string;
    glow: string;
    borderRadius: string;
    transition: string;
  };
  fonts: {
    primary: string;
    headline: string;
    mono: string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMAS OFICIAIS LUMINA PRO
// ═══════════════════════════════════════════════════════════════════════════

export const THEMES: Record<string, LuminaTheme> = {
  
  // ─────────────────────────────────────────────────────────────────────────
  // 1. HIGHLINE - Tema padrão ORIGINAL (BLINDADO - NÃO MODIFICAR!)
  // ─────────────────────────────────────────────────────────────────────────
  highline: {
    id: 'highline',
    name: 'Highline',
    description: 'Glassmorphism moderno com efeitos de vidro e cyan vibrante. O visual premium original do Lumina.',
    tags: ['Premium', 'Glassmorphism', 'Original'],
    layout: 'default',
    colors: {
      primary: '#06b6d4',
      primaryHover: '#22d3ee',
      secondary: '#8b5cf6',
      accent: '#f472b6',
      background: '#000000',
      surface: 'rgba(255, 255, 255, 0.05)',
      surfaceHover: 'rgba(255, 255, 255, 0.1)',
      surfaceHighest: 'rgba(255, 255, 255, 0.15)',
      text: '#ffffff',
      textMuted: 'rgba(255, 255, 255, 0.6)',
      border: 'rgba(255, 255, 255, 0.1)',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    effects: {
      glass: 'rgba(255, 255, 255, 0.05)',
      glassHover: 'rgba(255, 255, 255, 0.1)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
      blur: '20px',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      shadowHover: '0 8px 32px rgba(6, 182, 212, 0.2)',
      glow: '0 0 20px rgba(6, 182, 212, 0.15)',
      borderRadius: '16px',
      transition: '200ms ease',
    },
    fonts: {
      primary: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      headline: "system-ui, -apple-system, sans-serif",
      mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. LUMINA CRYSTALLINE - Light mode elegante "The Crystalline Concierge"
  // ─────────────────────────────────────────────────────────────────────────
  crystalline: {
    id: 'crystalline',
    name: 'Lumina Crystalline',
    description: 'A elegância da claridade. Superfícies cristalinas com blur, alto contraste e tipografia editorial. Perfeito para ambientes diurnos.',
    tags: ['Light Mode', 'Elegante', 'Editorial'],
    layout: 'default',
    colors: {
      primary: '#006591',        // Sky blue profundo
      primaryHover: '#0ea5e9',   // Sky blue vibrante
      secondary: '#6366f1',      // Indigo
      accent: '#0ea5e9',         // Primary container
      background: '#f7f9fb',     // Slate claro
      surface: 'rgba(255, 255, 255, 0.8)',
      surfaceHover: 'rgba(255, 255, 255, 0.95)',
      surfaceHighest: '#ffffff',
      text: '#191c1e',           // Quase preto
      textMuted: '#3e4850',      // Slate médio
      border: 'rgba(0, 0, 0, 0.08)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    effects: {
      glass: 'rgba(255, 255, 255, 0.8)',
      glassHover: 'rgba(255, 255, 255, 0.95)',
      glassBorder: 'rgba(0, 0, 0, 0.08)',
      blur: '16px',
      shadow: '0 20px 40px rgba(0, 101, 145, 0.05)',
      shadowHover: '0 24px 48px rgba(14, 165, 233, 0.1)',
      glow: 'none',
      borderRadius: '16px',
      transition: '200ms ease',
    },
    fonts: {
      primary: "'Inter', system-ui, -apple-system, sans-serif",
      headline: "'Inter', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. NEXUS AMBAR - "The Cinematic Orchestrator"
  // Dark mode sofisticado com âmbar/dourado
  // ─────────────────────────────────────────────────────────────────────────
  ambar: {
    id: 'ambar',
    name: 'Nexus Ambar',
    description: 'Sofisticação em tons profundos. Âmbar luminescente sobre obsidiano. Perfeito para home theaters e experiências cinematográficas.',
    tags: ['Premium', 'Cinema', 'Luxury'],
    layout: 'default',
    colors: {
      primary: '#f2c08d',        // Âmbar claro
      primaryHover: '#e5b885',
      secondary: '#c9956c',      // Âmbar escuro
      accent: '#d4a574',         // Gold
      background: '#0d0906',     // Obsidian brown-black
      surface: 'rgba(212, 165, 116, 0.06)',
      surfaceHover: 'rgba(212, 165, 116, 0.12)',
      surfaceHighest: '#1a1512',
      text: '#f5e6d3',           // Cream
      textMuted: '#8b7355',      // Warm gray
      border: 'rgba(212, 165, 116, 0.15)',
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
    },
    effects: {
      glass: 'rgba(212, 165, 116, 0.06)',
      glassHover: 'rgba(212, 165, 116, 0.12)',
      glassBorder: 'rgba(212, 165, 116, 0.15)',
      blur: '20px',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      shadowHover: '0 0 32px rgba(212, 165, 116, 0.08)',
      glow: '0 0 20px rgba(242, 192, 141, 0.2)',
      borderRadius: '12px',
      transition: '250ms ease',
    },
    fonts: {
      primary: "'Manrope', system-ui, -apple-system, sans-serif",
      headline: "'Manrope', system-ui, sans-serif",
      mono: "'SF Mono', ui-monospace, monospace",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. NEXUS BLUE - "The Luminous Concierge"
  // Simples, intuitivo, para hóspedes/idosos
  // ─────────────────────────────────────────────────────────────────────────
  blue: {
    id: 'blue',
    name: 'Nexus Blue',
    description: 'Simplicidade funcional com ícones grandes. Azul luminoso sobre navy profundo. Projetado para hóspedes, crianças ou idosos.',
    tags: ['Intuitivo', 'Acessível', 'Fácil'],
    layout: 'default',
    colors: {
      primary: '#adc6ff',        // Azul claro luminoso
      primaryHover: '#4d8eff',   // Azul vibrante
      secondary: '#06b6d4',      // Cyan
      accent: '#00f0ff',         // Cyan glow
      background: '#0a0e1a',     // Navy profundo
      surface: 'rgba(173, 198, 255, 0.08)',
      surfaceHover: 'rgba(173, 198, 255, 0.15)',
      surfaceHighest: '#222a3d',
      text: '#ffffff',
      textMuted: '#7b8794',
      border: 'rgba(173, 198, 255, 0.2)',
      success: '#22c55e',
      warning: '#ffb786',        // Laranja suave (não vermelho)
      error: '#ffb4ab',
    },
    effects: {
      glass: 'rgba(173, 198, 255, 0.08)',
      glassHover: 'rgba(173, 198, 255, 0.15)',
      glassBorder: 'rgba(173, 198, 255, 0.2)',
      blur: '20px',
      shadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
      shadowHover: '0 0 40px rgba(173, 198, 255, 0.08)',
      glow: '0 0 20px rgba(77, 142, 255, 0.15)',
      borderRadius: '20px',      // Mais arredondado = mais amigável
      transition: '200ms ease',
    },
    fonts: {
      primary: "'Plus Jakarta Sans', 'Nunito', system-ui, sans-serif",
      headline: "'Plus Jakarta Sans', system-ui, sans-serif",
      mono: "ui-monospace, monospace",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. SMARTHOME PRO - "Emerald Sector" inspired
  // Analytics e controle total com sidebar
  // ─────────────────────────────────────────────────────────────────────────
  pro: {
    id: 'pro',
    name: 'SmartHome Pro',
    description: 'Controle total. Dashboard data-dense com gráficos de consumo, logs em tempo real e controles avançados. Para power users.',
    tags: ['Analytics', 'Power User', 'Técnico'],
    layout: 'sidebar',
    colors: {
      primary: '#4edea3',        // Emerald vibrante
      primaryHover: '#34d399',
      secondary: '#06b6d4',      // Cyan
      accent: '#f59e0b',         // Amber para alertas
      background: '#0e131f',     // Deep space navy
      surface: 'rgba(78, 222, 163, 0.06)',
      surfaceHover: 'rgba(78, 222, 163, 0.12)',
      surfaceHighest: '#222a3d',
      text: '#e2e2e2',
      textMuted: 'rgba(226, 226, 226, 0.6)',
      border: 'rgba(78, 222, 163, 0.15)',
      success: '#4edea3',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    effects: {
      glass: 'rgba(78, 222, 163, 0.05)',
      glassHover: 'rgba(78, 222, 163, 0.1)',
      glassBorder: 'rgba(78, 222, 163, 0.12)',
      blur: '8px',               // Menos blur = mais técnico
      shadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
      shadowHover: '0 4px 20px rgba(78, 222, 163, 0.15)',
      glow: '0 0 16px rgba(78, 222, 163, 0.2)',
      borderRadius: '8px',       // Mais quadrado = mais técnico
      transition: '150ms ease',
    },
    fonts: {
      primary: "'Space Grotesk', 'IBM Plex Sans', system-ui, sans-serif",
      headline: "'Space Grotesk', system-ui, sans-serif",
      mono: "'IBM Plex Mono', 'Fira Code', monospace",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. LUMINA CINEMATIC - "Cybernetic Noir" (NOVO!)
  // Baseado no Highline Premium do Stitch
  // ─────────────────────────────────────────────────────────────────────────
  cinematic: {
    id: 'cinematic',
    name: 'Lumina Cinematic',
    description: 'Cybernetic Noir. Pure black OLED com cyan vibrante, glass-on-glass layering e glow effects. Experiência cinematográfica máxima.',
    tags: ['OLED', 'Cinematic', 'Cyberpunk'],
    layout: 'default',
    colors: {
      primary: '#4cd7f6',        // Cyan vibrante
      primaryHover: '#06b6d4',   // Cyan container
      secondary: '#a1cedb',      // Cyan suave
      accent: '#ffb873',         // Âmbar terciário
      background: '#000000',     // Pure OLED black
      surface: 'rgba(255, 255, 255, 0.03)',
      surfaceHover: 'rgba(255, 255, 255, 0.06)',
      surfaceHighest: '#353535',
      text: '#e2e2e2',
      textMuted: 'rgba(226, 226, 226, 0.6)',
      border: 'rgba(255, 255, 255, 0.05)',
      success: '#4ade80',
      warning: '#ffb873',
      error: '#ffb4ab',
    },
    effects: {
      glass: 'rgba(255, 255, 255, 0.03)',
      glassHover: 'rgba(255, 255, 255, 0.06)',
      glassBorder: 'rgba(255, 255, 255, 0.05)',
      blur: '20px',
      shadow: '0 0 20px rgba(76, 215, 246, 0.15)',
      shadowHover: '0 0 30px rgba(76, 215, 246, 0.25)',
      glow: '0 0 20px rgba(76, 215, 246, 0.15)',
      borderRadius: '8px',       // Sharp, architectural
      transition: '200ms ease',
    },
    fonts: {
      primary: "'Space Grotesk', 'Manrope', system-ui, sans-serif",
      headline: "'Space Grotesk', system-ui, sans-serif",
      mono: "'JetBrains Mono', ui-monospace, monospace",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. EMERALD KINETIC - "The Orbital Command" (NOVO!)
  // Technical, data-dense, verde esmeralda
  // ─────────────────────────────────────────────────────────────────────────
  emerald: {
    id: 'emerald',
    name: 'Emerald Kinetic',
    description: 'Precisão técnica inspirada em telemetria espacial. Verde esmeralda sobre deep space. Tipografia extrema e interface orbital.',
    tags: ['Technical', 'Orbital', 'Data-Dense'],
    layout: 'bento',
    colors: {
      primary: '#4edea3',        // Emerald vibrante
      primaryHover: '#34d399',
      secondary: '#a7f3d0',      // Mint claro
      accent: '#fbbf24',         // Amber para alertas
      background: '#0e131f',     // Deep space
      surface: 'rgba(78, 222, 163, 0.05)',
      surfaceHover: 'rgba(78, 222, 163, 0.1)',
      surfaceHighest: '#222a3d',
      text: '#e2e2e2',
      textMuted: 'rgba(226, 226, 226, 0.5)',
      border: 'rgba(78, 222, 163, 0.1)',
      success: '#4edea3',
      warning: '#fbbf24',
      error: '#f87171',
    },
    effects: {
      glass: 'rgba(78, 222, 163, 0.04)',
      glassHover: 'rgba(78, 222, 163, 0.08)',
      glassBorder: 'rgba(78, 222, 163, 0.1)',
      blur: '0px',               // Sem blur = precisão técnica
      shadow: 'none',
      shadowHover: '0 0 20px rgba(78, 222, 163, 0.2)',
      glow: '0 0 12px rgba(78, 222, 163, 0.3)',
      borderRadius: '4px',       // Muito quadrado = precision-tooled
      transition: '100ms ease',
    },
    fonts: {
      primary: "'Inter', system-ui, sans-serif",
      headline: "'Space Grotesk', system-ui, sans-serif",
      mono: "'Inter', ui-monospace, monospace",
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════

export const getTheme = (themeId: string): LuminaTheme => {
  return THEMES[themeId] || THEMES.highline;
};

export const getThemeList = (): LuminaTheme[] => {
  return Object.values(THEMES);
};

export const applyTheme = (theme: LuminaTheme): void => {
  const root = document.documentElement;
  
  // Colors
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-surface-hover', theme.colors.surfaceHover);
  root.style.setProperty('--color-surface-highest', theme.colors.surfaceHighest);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-muted', theme.colors.textMuted);
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-warning', theme.colors.warning);
  root.style.setProperty('--color-error', theme.colors.error);
  
  // Effects
  root.style.setProperty('--glass-bg', theme.effects.glass);
  root.style.setProperty('--glass-bg-hover', theme.effects.glassHover);
  root.style.setProperty('--glass-border', theme.effects.glassBorder);
  root.style.setProperty('--blur', theme.effects.blur);
  root.style.setProperty('--shadow', theme.effects.shadow);
  root.style.setProperty('--shadow-hover', theme.effects.shadowHover);
  root.style.setProperty('--glow', theme.effects.glow);
  root.style.setProperty('--border-radius', theme.effects.borderRadius);
  root.style.setProperty('--transition', theme.effects.transition);
  
  // Fonts
  root.style.setProperty('--font-primary', theme.fonts.primary);
  root.style.setProperty('--font-headline', theme.fonts.headline);
  root.style.setProperty('--font-mono', theme.fonts.mono);
  
  // Apply body styles
  document.body.style.backgroundColor = theme.colors.background;
  document.body.style.color = theme.colors.text;
  document.body.style.fontFamily = theme.fonts.primary;
  
  // ═══════════════════════════════════════════════════════════════════════
  // INJECT THEME CSS OVERRIDES
  // Sobrescreve classes Tailwind com as cores do tema
  // ═══════════════════════════════════════════════════════════════════════
  const styleId = 'lumina-theme-overrides';
  let styleEl = document.getElementById(styleId);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  
  // Gerar CSS de override baseado no tema
  styleEl.textContent = `
    /* Lumina Theme Overrides - ${theme.name} */
    
    /* Background & Surface */
    body, .bg-black { background-color: ${theme.colors.background} !important; }
    
    /* Primary color overrides */
    .text-cyan-400, .text-cyan-500 { color: ${theme.colors.primary} !important; }
    .bg-cyan-400, .bg-cyan-500 { background-color: ${theme.colors.primary} !important; }
    .border-cyan-400, .border-cyan-500 { border-color: ${theme.colors.primary} !important; }
    .ring-cyan-400, .ring-cyan-500 { --tw-ring-color: ${theme.colors.primary} !important; }
    
    /* Glass cards */
    .backdrop-blur-xl, .backdrop-blur-lg, .backdrop-blur-md {
      background: ${theme.effects.glass} !important;
      border-color: ${theme.effects.glassBorder} !important;
    }
    
    /* Buttons and interactive elements */
    .bg-cyan-500\\/20, .bg-cyan-400\\/20 { 
      background-color: ${theme.colors.primary}33 !important; 
    }
    .hover\\:bg-cyan-500\\/30:hover { 
      background-color: ${theme.colors.primary}4D !important; 
    }
    
    /* Border radius based on theme */
    .rounded-2xl, .rounded-xl, .rounded-lg {
      border-radius: ${theme.effects.borderRadius} !important;
    }
    
    /* Text colors */
    .text-white { color: ${theme.colors.text} !important; }
    .text-white\\/60, .text-white\\/50, .text-white\\/40 { 
      color: ${theme.colors.textMuted} !important; 
    }
    
    /* Success/Warning/Error */
    .text-green-400, .text-green-500 { color: ${theme.colors.success} !important; }
    .text-yellow-400, .text-amber-400 { color: ${theme.colors.warning} !important; }
    .text-red-400, .text-red-500 { color: ${theme.colors.error} !important; }
    
    /* Secondary colors */
    .text-purple-400, .text-violet-400 { color: ${theme.colors.secondary} !important; }
    .bg-purple-500\\/20 { background-color: ${theme.colors.secondary}33 !important; }
    
    /* Glow effects */
    .shadow-lg, .shadow-xl {
      box-shadow: ${theme.effects.shadow} !important;
    }
    
    /* Font family */
    body, * {
      font-family: ${theme.fonts.primary} !important;
    }
    h1, h2, h3, .font-bold, .font-semibold {
      font-family: ${theme.fonts.headline} !important;
    }
    code, pre, .font-mono {
      font-family: ${theme.fonts.mono} !important;
    }
  `;
  
  // Store in localStorage
  localStorage.setItem('lumina-theme', theme.id);
};

export const loadSavedTheme = (): LuminaTheme => {
  const savedId = localStorage.getItem('lumina-theme') || 'highline';
  return getTheme(savedId);
};

export const initTheme = (): void => {
  const theme = loadSavedTheme();
  applyTheme(theme);
};
