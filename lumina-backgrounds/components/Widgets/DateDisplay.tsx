import React from 'react';

export const DateDisplay: React.FC = () => {
  const date = new Date();
  
  return (
    <div className="text-white drop-shadow-md flex flex-col justify-center h-full">
      <div className="text-lg font-light capitalize opacity-90 leading-tight">
        {date.toLocaleDateString('pt-BR', { weekday: 'long' })}
      </div>
      <div className="text-xl font-bold uppercase tracking-wider text-white/80 leading-tight">
        {date.toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
      </div>
       <div className="text-sm font-medium text-white/60 leading-tight">
        {date.toLocaleDateString('pt-BR', { year: 'numeric' })}
      </div>
    </div>
  );
};
