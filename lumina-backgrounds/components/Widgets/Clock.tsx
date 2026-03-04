import React, { useEffect, useState } from 'react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Keep 1s interval to ensure minute changes are synced instantly
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col drop-shadow-lg justify-center">
      <div className="text-6xl md:text-7xl font-bold text-white tracking-tighter leading-none">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
      </div>
    </div>
  );
};