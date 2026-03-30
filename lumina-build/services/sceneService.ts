// ═══════════════════════════════════════════════════════════════════════════
//  SCENE SERVICE - Integração com Lumina Scene Manager (Hubitat)
// ═══════════════════════════════════════════════════════════════════════════

export interface SceneConfig {
  enabled: boolean;
  apiUrl: string;
  accessToken: string;
}

export interface SceneDevice {
  id: string;
  name: string;
  label: string;
  capabilities: string[];
  commands: string[];
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  actionsCount: number;
  createdAt: string;
}

export interface SceneAction {
  deviceId: string;
  command: string;
  args?: (string | number)[];
}

// ═══════════════════════════════════════════════════════════════════════════
//  STORAGE
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'lumina_scene_config';

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  enabled: false,
  apiUrl: '',
  accessToken: '',
};

export function getSceneConfig(): SceneConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SCENE_CONFIG, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('[Scene] Failed to load config:', e);
  }
  return DEFAULT_SCENE_CONFIG;
}

export function saveSceneConfig(config: SceneConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('[Scene] Failed to save config:', e);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  API CALLS
// ═══════════════════════════════════════════════════════════════════════════

async function callSceneAPI(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
  const config = getSceneConfig();
  if (!config.enabled || !config.apiUrl || !config.accessToken) {
    throw new Error('Scene Manager não configurado');
  }

  const url = `${config.apiUrl}${endpoint}?access_token=${config.accessToken}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Erro na API');
  }

  return data;
}

// ═══════════════════════════════════════════════════════════════════════════
//  PUBLIC METHODS
// ═══════════════════════════════════════════════════════════════════════════

export async function listSceneDevices(): Promise<SceneDevice[]> {
  const data = await callSceneAPI('/devices');
  return data.devices || [];
}

export async function listScenes(): Promise<Scene[]> {
  const data = await callSceneAPI('/scenes');
  return data.scenes || [];
}

export async function createScene(
  name: string, 
  actions: SceneAction[], 
  description?: string
): Promise<{ sceneId: string; name: string }> {
  const data = await callSceneAPI('/scenes', 'POST', {
    name,
    description: description || '',
    actions,
  });
  return { sceneId: data.sceneId, name: data.name };
}

export async function runScene(sceneId: string): Promise<{ sceneName: string; executed: any[] }> {
  const data = await callSceneAPI(`/scenes/${sceneId}/run`, 'POST');
  return { sceneName: data.sceneName, executed: data.executed };
}

export async function deleteScene(sceneId: string): Promise<void> {
  await callSceneAPI(`/scenes/${sceneId}`, 'DELETE');
}

export async function testConnection(): Promise<boolean> {
  try {
    await callSceneAPI('/scenes');
    return true;
  } catch {
    return false;
  }
}
