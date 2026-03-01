
const DEV_SECRET = 'LUMINA_HIGHLINE_MASTER_KEY_2024';
const LICENSE_STORAGE_KEY = 'lumina_license_key';

// Simple DJB2 hash function (same as in the HTML)
const djb2Hash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, 'X');
};

export const generateInstallId = (token: string): string => {
  if (!token) return 'LUM-XXXX-XXXX';
  // Use the token to generate a unique ID
  // We use the same hash function to get a consistent 8-char hex
  const hash = djb2Hash(token); 
  // Format: LUM-XXXX-XXXX
  return `LUM-${hash.substring(0, 4)}-${hash.substring(4, 8)}`;
};

export const generateLicenseKey = (installId: string): string => {
  const combined = installId + DEV_SECRET;
  const hex = djb2Hash(combined);
  // Format: A1B2-C3D4-E5F6 (derived from the hex)
  // Logic from HTML: 
  // const key = `${hex.substring(0, 4)}-${hex.substring(4, 8)}-${hex.substring(0, 2)}${hex.substring(6, 8)}`;
  return `${hex.substring(0, 4)}-${hex.substring(4, 8)}-${hex.substring(0, 2)}${hex.substring(6, 8)}`;
};

export const validateLicense = (token: string, key: string): boolean => {
  if (!token || !key) return false;
  const installId = generateInstallId(token);
  const expectedKey = generateLicenseKey(installId);
  
  // Normalize keys (remove dashes, uppercase) for comparison if needed, 
  // but the generator produces a specific format, so strict comparison is best.
  return key.trim().toUpperCase() === expectedKey;
};

export const saveLicense = (key: string) => {
  localStorage.setItem(LICENSE_STORAGE_KEY, key);
};

export const getSavedLicense = (): string | null => {
  return localStorage.getItem(LICENSE_STORAGE_KEY);
};

export const isAppRegistered = (token: string): boolean => {
    const savedKey = getSavedLicense();
    if (!savedKey) return false;
    return validateLicense(token, savedKey);
};
