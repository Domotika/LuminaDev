import React from 'react';
import { WeatherData } from '../../types';
import { WeatherIcon } from '../WeatherIcon';

interface WeatherProps {
  data: WeatherData | null;
  loading: boolean;
  locationName: string;
}

export const Weather: React.FC<WeatherProps> = ({ data, loading, locationName }) => {
  if (loading) return <div className="text-white/50 text-xs animate-pulse p-2">Carregando...</div>;
  if (!data) return null;

  return (
    <div className="flex flex-col text-white w-full">
      {/* Current Weather Header - Compact */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/20">
        <div className="flex items-center gap-3">
           <WeatherIcon code={data.weatherCode} isDay={data.isDay} className="w-10 h-10 text-yellow-300 drop-shadow-md" />
           <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-tighter">{Math.round(data.temperature)}°</span>
              <span className="text-[10px] font-medium uppercase tracking-widest opacity-80">{locationName}</span>
           </div>
        </div>
        <div className="flex flex-col items-end text-right">
           <span className="text-sm font-medium capitalize text-blue-100">{data.description}</span>
           <span className="text-[10px] text-white/60">Vento: {data.windSpeed} km/h</span>
           <div className="flex gap-1 mt-0.5 text-xs">
             <span className="text-red-300">H:{data.forecast[0]?.maxTemp}°</span>
             <span className="text-blue-300">L:{data.forecast[0]?.minTemp}°</span>
           </div>
        </div>
      </div>

      {/* 5 Day Forecast List - Compact */}
      <div className="flex flex-col gap-1.5">
        {data.forecast.map((day, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
             <span className="w-8 font-semibold text-white/90">{day.date}</span>
             <div className="flex-1 flex justify-center">
               <WeatherIcon code={day.weatherCode} className="w-4 h-4 text-white/80" />
             </div>
             <div className="flex gap-2 w-16 justify-end">
                <span className="font-bold">{day.maxTemp}°</span>
                <span className="text-white/50">{day.minTemp}°</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
