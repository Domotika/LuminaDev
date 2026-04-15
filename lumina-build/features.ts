/**
 * Lumina Dashboard - Feature Flags
 * 
 * Controla quais features estão disponíveis em cada versão.
 * 
 * BUILD STANDARD (v1.5): IS_PRO = false
 * BUILD PRO (v2.0): IS_PRO = true
 * 
 * Para buildar:
 * - Standard: npm run build
 * - PRO: npm run build:pro
 */

// Esta variável é substituída em build time pelo Vite
export const IS_PRO = import.meta.env.VITE_IS_PRO === 'true';

// Features PRO
export const FEATURES = {
  // v1.5 Standard - Básico
  DEVICE_CONTROL: true,      // Controle de dispositivos
  ROOMS: true,               // Organização por ambientes
  SCENES: true,              // Cenas/automações
  EDIT_MODE: true,           // Modo edição de layout
  CUSTOM_BACKGROUNDS: true,  // Fundos personalizados
  
  // v2.0 PRO - Premium
  THEME_SYSTEM: IS_PRO,      // Sistema de temas visuais
  CAMERAS_IP: IS_PRO,        // Câmeras IP
  FAVORITES: IS_PRO,         // Barra de favoritos
  ENERGY_MONITOR: IS_PRO,    // Monitoramento de energia
  HOME_WIDGETS: IS_PRO,      // Widgets na home (slideshow, QR, etc)
  NOTIFICATIONS: IS_PRO,     // Sistema de notificações
  SIDEBAR_LAYOUT: IS_PRO,    // Layout SmartHome Pro (sidebar)
  CLOUD_SYNC: IS_PRO,        // Sincronização via cloud
};

// Versão do build
export const VERSION = IS_PRO ? '2.0-PRO' : '1.5';
export const VERSION_NAME = IS_PRO ? 'Lumina PRO' : 'Lumina';
