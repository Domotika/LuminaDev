/**
 * Lumina 3D Model Service
 * Integrates with Hubitat 3D Model Manager Driver
 */

export interface Model3DInfo {
  success: boolean;
  model?: string;
  url?: string;
  lastUpdated?: string;
  totalModels?: number;
  message?: string;
}

export interface ModelListResponse {
  success: boolean;
  models?: string[];
  total?: number;
  activeModel?: string;
  message?: string;
}

/**
 * Get active 3D model info from Hubitat
 */
export async function getActiveModel(hubIp: string, deviceId: string): Promise<Model3DInfo> {
  try {
    const response = await fetch(`http://${hubIp}/apps/api/your-app-id/device/${deviceId}/getActiveModelInfo`, {
      method: 'GET',
      headers: {
        'Access-Token': getHubitatToken(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching active 3D model:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

/**
 * List all available 3D models
 */
export async function listModels(hubIp: string, deviceId: string): Promise<ModelListResponse> {
  try {
    const response = await fetch(`http://${hubIp}/apps/api/your-app-id/device/${deviceId}/listModels`, {
      method: 'GET',
      headers: {
        'Access-Token': getHubitatToken(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error listing 3D models:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Set active 3D model
 */
export async function setActiveModel(hubIp: string, deviceId: string, fileName: string): Promise<Model3DInfo> {
  try {
    const response = await fetch(`http://${hubIp}/apps/api/your-app-id/device/${deviceId}/setActiveModel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': getHubitatToken(),
      },
      body: JSON.stringify({ fileName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error setting active 3D model:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

/**
 * Get model URL for direct loading
 */
export function getModelUrl(hubIp: string, fileName: string): string {
  return `http://${hubIp}/local/${fileName}`;
}

/**
 * Get stored Hubitat token from localStorage
 */
function getHubitatToken(): string {
  try {
    const config = localStorage.getItem('lumina_config');
    if (config) {
      const parsed = JSON.parse(config);
      return parsed.accessToken || '';
    }
  } catch (error) {
    console.error('Error getting Hubitat token:', error);
  }
  return '';
}

/**
 * Validate if a file is a valid GLB model
 */
export function isValidGLBFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.glb');
}

/**
 * Get default model configuration
 */
export function getDefaultModelConfig() {
  return {
    defaultFileName: 'lumina_apartamento.glb',
    supportedFormats: ['.glb'],
    maxFileSize: '50MB', // Recommended max size
    deviceType: 'Lumina 3D Model Manager'
  };
}