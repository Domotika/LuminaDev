
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

const Location: React.FC = () => {
  return (
    <section id="location" className="bg-[#FDFBF7] py-24 px-6 md:px-12 border-t border-[#D6D1C7]">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Text Side */}
        <div className="lg:col-span-5 space-y-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-4 block">Coordenadas</span>
            <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26] leading-tight">
              Onde a calma <br/> encontra o destino.
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="w-10 h-10 bg-[#7895B2]/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#7895B2]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-[#3E3E3E] mb-1">Endereço</h4>
                <p className="text-[#5D5A53] font-light leading-relaxed">
                  Servidão Pintado, 11 — Guarda do Embaú<br/>
                  Palhoça, Santa Catarina, Brasil
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-10 h-10 bg-[#7895B2]/10 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#7895B2]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest text-[#3E3E3E] mb-1">Proximidade</h4>
                <p className="text-[#5D5A53] font-light leading-relaxed">
                  300m do Rio da Madre<br/>
                  5 min de caminhada até a Vila
                </p>
              </div>
            </div>
          </div>

          <a 
            href="https://www.google.com/maps/dir//Pousada+Acauan+-+Servid%C3%A3o+Pintado,+11+-+Guarda+do+Emba%C3%BA,+Palho%C3%A7a+-+SC,+88139-406/@-27.9015112,-48.5973347,17z" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block py-4 px-10 bg-[#3E3E3E] text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#7895B2] transition-all duration-500 shadow-lg"
          >
            Abrir no Google Maps
          </a>
        </div>

        {/* Map Side */}
        <div className="lg:col-span-7 h-[500px] w-full relative group">
          <div className="absolute inset-0 bg-[#7895B2]/5 pointer-events-none z-10 transition-opacity group-hover:opacity-0"></div>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3527.182415174092!2d-48.59728512351234!3d-27.9015438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9526da06873528b7%3A0xc6c7b99c855a0f6a!2sPousada%20Acauan!5e0!3m2!1spt-BR!2sbr!4v1710000000000!5m2!1spt-BR!2sbr" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'grayscale(0.3) contrast(1.1) brightness(0.95)' }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização Pousada Acauan"
            className="grayscale-[0.2] sepia-[0.1] hover:grayscale-0 transition-all duration-1000"
          ></iframe>
        </div>

      </div>
    </section>
  );
};

export default Location;
