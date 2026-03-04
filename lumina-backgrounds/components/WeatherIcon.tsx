import React from 'react';

interface WeatherIconProps {
  code: number;
  className?: string;
  isDay?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, className = "w-6 h-6", isDay = true }) => {
  // Simple mapping of WMO codes to SVG paths
  
  // Sun / Clear
  if (code === 0 || code === 1) {
    if (!isDay) {
        // Moon
        return (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        );
    }
    // Sun
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  }

  // Cloud / Partly Cloudy
  if (code === 2 || code === 3) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    );
  }

  // Fog
  if (code === 45 || code === 48) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15h18M3 12h18M3 9h18" />
      </svg>
    );
  }

  // Rain / Drizzle
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25" />
      </svg>
    );
  }

  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m-9-9h18m-2.5-6.5L5.5 18.5M5.5 5.5l13 13" />
      </svg>
    );
  }

  // Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }

  // Default (Cloud)
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
};
