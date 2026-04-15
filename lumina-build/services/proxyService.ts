/**
 * Proxy Service for Mixed Content Resolution
 * Serves Hubitat resources through HTTPS to avoid Mixed Content errors
 */

/**
 * Proxy a Hubitat resource through our service to avoid Mixed Content
 */
export function getProxiedUrl(hubIp: string, resource: string): string {
  // For now, try to use data: URL or blob approach
  // In production, this would use a proper proxy server
  
  // Fallback: return original URL and let user handle mixed content
  return `http://${hubIp}/${resource}`;
}

/**
 * Fetch resource and convert to blob URL to bypass Mixed Content
 */
export async function fetchAsBlob(hubIp: string, resource: string): Promise<string> {
  try {
    const response = await fetch(`http://${hubIp}/${resource}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error fetching resource as blob:', error);
    throw error;
  }
}

/**
 * Preload GLB model as blob URL
 */
export async function preloadGLBModel(hubIp: string, fileName: string): Promise<string> {
  try {
    // Try HTTPS first, fallback to HTTP
    const httpsUrl = `https://${hubIp}/local/${fileName}`;
    const httpUrl = `http://${hubIp}/local/${fileName}`;
    
    console.log(`[3D Model] Trying HTTPS: ${httpsUrl}`);
    
    let response;
    try {
      response = await fetch(httpsUrl);
      if (!response.ok) throw new Error(`HTTPS failed: ${response.status}`);
      console.log(`[3D Model] HTTPS successful!`);
    } catch (httpsError) {
      console.log(`[3D Model] HTTPS failed, trying HTTP: ${httpUrl}`);
      response = await fetch(httpUrl);
      if (!response.ok) {
        throw new Error(`Both HTTPS and HTTP failed: ${response.status} - ${response.statusText}`);
      }
      console.log(`[3D Model] HTTP fallback successful!`);
    }
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    console.log(`[3D Model] GLB preloaded successfully: ${blobUrl}`);
    return blobUrl;
    
  } catch (error) {
    console.error(`[3D Model] Failed to preload GLB:`, error);
    throw new Error(`Failed to load 3D model: ${error.message}`);
  }
}