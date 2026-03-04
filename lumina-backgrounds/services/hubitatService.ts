import { HubitatConfig, HubitatDevice } from '../types';

const buildBaseUrl = (config: HubitatConfig): string => {
  if (config.useCloud && config.hubUuid) {
    return `https://cloud.hubitat.com/api/${config.hubUuid}/apps/${config.appId}`;
  }
  const ip = config.hubIp.trim();
  const base = ip.startsWith('http') ? ip : `http://${ip}`;
  return `${base.replace(/\/$/, '')}/apps/api/${config.appId}`;
};

export const fetchDevices = async (config: HubitatConfig): Promise<HubitatDevice[]> => {
  if (!config.hubIp || !config.appId || !config.accessToken) {
    return [];
  }

  try {
    const baseUrl = buildBaseUrl(config);
    const response = await fetch(`${baseUrl}/devices?access_token=${config.accessToken}`);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const devices = await response.json();
    return devices.map((d: any) => ({
      id: d.id,
      name: d.label || d.name,
      type: d.type,
      state: {}
    }));
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    return [];
  }
};

export const fetchDeviceStatus = async (config: HubitatConfig, deviceId: string): Promise<any> => {
  if (!config.hubIp || !config.appId || !config.accessToken) {
    return null;
  }

  try {
    const baseUrl = buildBaseUrl(config);
    const response = await fetch(`${baseUrl}/devices/${deviceId}?access_token=${config.accessToken}`);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const device = await response.json();
    const state: Record<string, any> = {};
    
    if (device.attributes) {
      device.attributes.forEach((attr: any) => {
        state[attr.name] = attr.currentValue;
      });
    }
    
    return { ...device, state };
  } catch (error) {
    console.error(`Failed to fetch device ${deviceId}:`, error);
    return null;
  }
};

export const sendCommand = async (
  config: HubitatConfig,
  deviceId: string,
  command: string,
  args?: (string | number)[]
): Promise<boolean> => {
  if (!config.hubIp || !config.appId || !config.accessToken) {
    return false;
  }

  try {
    const baseUrl = buildBaseUrl(config);
    let url = `${baseUrl}/devices/${deviceId}/${command}`;
    
    if (args && args.length > 0) {
      url += `/${args.join(',')}`;
    }
    
    url += `?access_token=${config.accessToken}`;
    
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error(`Failed to send command ${command} to ${deviceId}:`, error);
    return false;
  }
};

export const triggerScene = async (sceneUrl: string): Promise<boolean> => {
  if (!sceneUrl) return false;
  
  try {
    await fetch(sceneUrl, { mode: 'no-cors' });
    return true;
  } catch (error) {
    console.error('Failed to trigger scene:', error);
    return false;
  }
};

// Storage functions
const SETTINGS_KEY = 'lumina_bg_settings';
const WIDGETS_KEY = 'lumina_bg_widgets';

export const saveSettings = (settings: any): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadSettings = (): any | null => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveWidgets = (widgets: any[]): void => {
  localStorage.setItem(WIDGETS_KEY, JSON.stringify(widgets));
};

export const loadWidgets = (): any[] => {
  try {
    const data = localStorage.getItem(WIDGETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};
