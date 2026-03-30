// ═══════════════════════════════════════════════════════════════════════════
//  FEATURES - Lumina Dashboard Feature Flags
// ═══════════════════════════════════════════════════════════════════════════

// Esta variável é substituída em build time pelo Vite
export const IS_PRO = import.meta.env.VITE_IS_PRO === 'true' || true; // Default true for this build

// Features PRO
export const FEATURES = {
  // v1.5 Standard - Básico
  DEVICE_CONTROL: true,
  ROOMS: true,
  SCENES: true,
  EDIT_MODE: true,
  CUSTOM_BACKGROUNDS: true,
  
  // v2.0 PRO - Premium
  THEME_SYSTEM: IS_PRO,
  CAMERAS_IP: IS_PRO,
  FAVORITES: IS_PRO,
  ENERGY_MONITOR: IS_PRO,
  HOME_WIDGETS: IS_PRO,
  NOTIFICATIONS: IS_PRO,
  SIDEBAR_LAYOUT: IS_PRO,
  CLOUD_SYNC: IS_PRO,
  AI_ASSISTANT: IS_PRO, // NEW - AI Chat
};

// Versão do build
export const VERSION = IS_PRO ? '2.0-PRO-AI' : '1.5';
export const VERSION_NAME = IS_PRO ? 'Lumina PRO' : 'Lumina';
