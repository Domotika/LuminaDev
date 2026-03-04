import { WeatherData, DailyForecast } from '../types';

// WMO Weather interpretation codes (WW) - Translated to Portuguese
const getWeatherDescription = (code: number): string => {
  const codes: Record<number, string> = {
    0: 'Céu limpo',
    1: 'Predom. limpo',
    2: 'Parcialmente nublado',
    3: 'Encoberto',
    45: 'Nevoeiro',
    48: 'Nevoeiro com geada',
    51: 'Chuvisco leve',
    53: 'Chuvisco moderado',
    55: 'Chuvisco denso',
    61: 'Chuva leve',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    71: 'Neve leve',
    73: 'Neve moderada',
    75: 'Neve forte',
    95: 'Trovoada',
  };
  return codes[code] || 'Desconhecido';
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    // Fetch current weather AND daily forecast
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.current_weather || !data.daily) throw new Error("Invalid weather data");

    // Process 5-day forecast
    const forecast: DailyForecast[] = [];
    // We start from index 1 to get "tomorrow" onwards, or 0 if we want today included. 
    // Usually dashboards show Today + next 4 days.
    for (let i = 0; i < 5; i++) {
        const dateObj = new Date(data.daily.time[i]);
        // Format day name in PT-BR (e.g., "seg.", "ter.")
        const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        
        forecast.push({
            date: i === 0 ? 'Hoje' : dayName.charAt(0).toUpperCase() + dayName.slice(1),
            maxTemp: Math.round(data.daily.temperature_2m_max[i]),
            minTemp: Math.round(data.daily.temperature_2m_min[i]),
            weatherCode: data.daily.weathercode[i]
        });
    }

    return {
      temperature: data.current_weather.temperature,
      weatherCode: data.current_weather.weathercode,
      isDay: data.current_weather.is_day === 1,
      windSpeed: data.current_weather.windspeed,
      description: getWeatherDescription(data.current_weather.weathercode),
      forecast: forecast
    };
  } catch (error) {
    console.warn("Failed to fetch weather, using fallback data.", error);
    // Return fallback data
    return {
      temperature: 22,
      weatherCode: 1,
      isDay: true,
      windSpeed: 0,
      description: 'Serviço Indisponível',
      forecast: [
          { date: 'Hoje', maxTemp: 24, minTemp: 18, weatherCode: 1 },
          { date: 'Seg', maxTemp: 25, minTemp: 19, weatherCode: 2 },
          { date: 'Ter', maxTemp: 23, minTemp: 18, weatherCode: 3 },
          { date: 'Qua', maxTemp: 22, minTemp: 17, weatherCode: 61 },
          { date: 'Qui', maxTemp: 24, minTemp: 18, weatherCode: 0 },
      ]
    };
  }
};
