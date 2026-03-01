// Config keys
const SPOTIFY_TOKEN_KEY = 'lumina_spotify_token';
const SPOTIFY_CLIENT_ID_KEY = 'lumina_spotify_client_id';

export interface SpotifyConfig {
  clientId: string;
}

export interface SpotifyState {
  item?: {
    name: string;
    artists: { name: string }[];
    album: { images: { url: string }[] };
    duration_ms: number;
  };
  is_playing: boolean;
  progress_ms: number;
  device?: {
    name: string;
    volume_percent: number;
  };
}

// Scopes needed for playback control and reading state
const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
];

export const saveSpotifyClientId = (id: string) => localStorage.setItem(SPOTIFY_CLIENT_ID_KEY, id);
export const getSpotifyClientId = () => localStorage.getItem(SPOTIFY_CLIENT_ID_KEY);

export const getAuthUrl = (clientId: string) => {
  const redirectUri = window.location.origin + '/'; // Redirect back to root
  return `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPES.join(' '))}&response_type=token&show_dialog=true`;
};

export const getToken = () => localStorage.getItem(SPOTIFY_TOKEN_KEY);

export const saveTokenFromHash = () => {
  const hash = window.location.hash;
  if (hash && hash.includes('access_token')) {
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get('access_token');
    if (token) {
      localStorage.setItem(SPOTIFY_TOKEN_KEY, token);
      window.location.hash = ''; // Clear hash
      return true;
    }
  }
  return false;
};

export const logoutSpotify = () => {
    localStorage.removeItem(SPOTIFY_TOKEN_KEY);
};

// API Calls
const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
  const token = getToken();
  if (!token) throw new Error('No token');

  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    logoutSpotify(); // Token expired
    throw new Error('Expired');
  }
  
  if (res.status === 204) return null; // No content
  return res.json();
};

export const getPlayerState = async (): Promise<SpotifyState | null> => {
  try {
    return await apiCall('/me/player');
  } catch (e) {
    return null;
  }
};

export const playPause = async (isPlaying: boolean) => {
  try {
    await apiCall(isPlaying ? '/me/player/pause' : '/me/player/play', 'PUT');
  } catch (e) { console.error(e); }
};

export const nextTrack = async () => {
  try {
    await apiCall('/me/player/next', 'POST');
  } catch (e) { console.error(e); }
};

export const prevTrack = async () => {
  try {
    await apiCall('/me/player/previous', 'POST');
  } catch (e) { console.error(e); }
};