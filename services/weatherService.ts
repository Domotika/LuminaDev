import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';
import React from 'react';

export interface WeatherConfig {
  city: string;
  lat: number;
  lon: number;
}

export interface DailyForecast {
  date: string;
  code: number;
  min: number;
  max: number;
}

export interface CurrentWeather {
  temperature: number;
  code: number;
  isDay: boolean;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
}

// Persist Config
const WEATHER_CONFIG_KEY = 'lumina_weather_config';

export const getSavedWeatherConfig = (): WeatherConfig | null => {
  const data = localStorage.getItem(WEATHER_CONFIG_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveWeatherConfig = (config: WeatherConfig) => {
  localStorage.setItem(WEATHER_CONFIG_KEY, JSON.stringify(config));
};

// Open-Meteo Geocoding API
export const searchCity = async (query: string) => {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`);
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    console.error("City search failed", e);
    return [];
  }
};

// Open-Meteo Forecast API
export const getWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    const data = await res.json();

    if (!data || !data.current_weather || !data.daily) return null;

    const daily: DailyForecast[] = data.daily.time.map((t: string, i: number) => ({
      date: t, // YYYY-MM-DD
      code: data.daily.weathercode[i],
      min: Math.round(data.daily.temperature_2m_min[i]),
      max: Math.round(data.daily.temperature_2m_max[i]),
    })).slice(0, 5); // Take 5 days

    return {
      current: {
        temperature: Math.round(data.current_weather.temperature),
        code: data.current_weather.weathercode,
        isDay: data.current_weather.is_day === 1
      },
      daily
    };
  } catch (e) {
    console.error("Weather fetch failed", e);
    return null;
  }
};

// Helper to get Icon and Description based on WMO Weather Code
export const getWeatherInfo = (code: number, isDay: boolean = true) => {
  // WMO Weather interpretation codes (WW)
  // 0: Clear sky
  if (code === 0) return { icon: Sun, label: 'Limpo', color: 'text-white' };
  
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  if (code >= 1 && code <= 3) return { icon: Cloud, label: 'Nublado', color: 'text-white' };
  
  // 45, 48: Fog
  if (code === 45 || code === 48) return { icon: CloudFog, label: 'Neblina', color: 'text-white' };
  
  // 51, 53, 55: Drizzle
  // 56, 57: Freezing Drizzle
  if (code >= 51 && code <= 57) return { icon: CloudDrizzle, label: 'Garoa', color: 'text-white' };
  
  // 61, 63, 65: Rain
  // 66, 67: Freezing Rain
  // 80, 81, 82: Rain showers
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { icon: CloudRain, label: 'Chuva', color: 'text-white' };
  
  // 71, 73, 75: Snow fall
  // 77: Snow grains
  // 85, 86: Snow showers
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { icon: CloudSnow, label: 'Neve', color: 'text-white' };
  
  // 95: Thunderstorm
  // 96, 99: Thunderstorm with hail
  if (code >= 95 && code <= 99) return { icon: CloudLightning, label: 'Tempestade', color: 'text-white' };

  return { icon: Sun, label: 'Desconhecido', color: 'text-white' };
};

export const getDayName = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  
  // Reset time parts for comparison
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (d1.getTime() === d2.getTime()) return 'Hoje';
  
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
};