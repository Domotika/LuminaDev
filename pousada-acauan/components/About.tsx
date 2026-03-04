
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="bg-[#EBE7DE]">
      
      {/* Introduction */}
      <div className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto flex flex-col md:flex-row items-start gap-16 md:gap-32">
        <div className="md:w-1/3">
          <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26] leading-tight">
            Raízes na areia, <br/> conforto na alma.
          </h2>
        </div>
        <div className="md:w-2/3 max-w-2xl">
          <p className="text-lg md:text-xl text-[#5D5A53] font-light leading-relaxed mb-8">
            A Pousada Acauan nasceu do desejo de integrar a hospitalidade ao ritmo natural da Guarda do Embaú. Aqui, o tempo não é medido por horas, mas pelas marés do Rio da Madre.
          </p>
          <p className="text-lg md:text-xl text-[#5D5A53] font-light leading-relaxed mb-8">
            Estamos estrategicamente localizados a apenas 300 metros da margem do rio e do acesso principal à praia, permitindo que nossos hóspedes esqueçam o carro e vivam a vila em sua essência mais pura.
          </p>
          <img 
            src="https://i.ibb.co/n8DgwvPq/521685167.jpg" 
            alt="Pousada Acauan Exterior" 
            className="w-full h-[500px] object-cover mt-12 shadow-sm"
          />
          <p className="text-sm font-medium uppercase tracking-widest text-[#A8A29E] mt-4">
            Pousada Acauan — Seu refúgio na Guarda
          </p>
        </div>
      </div>

      {/* Philosophy Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        <div className="order-2 lg:order-1 relative h-[500px] lg:h-auto overflow-hidden group">
           <img 
             src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200" 
             alt="Praia da Guarda" 
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
           />
        </div>
        <div className="order-1 lg:order-2 flex flex-col justify-center p-12 lg:p-24 bg-[#D6D1C7]">
           <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5D5A53] mb-6">Localização</span>
           <h3 className="text-4xl md:text-5xl font-serif mb-8 text-[#2C2A26] leading-tight">
             Onde o rio <br/> encontra o mar.
           </h3>
           <p className="text-lg text-[#5D5A53] font-light leading-relaxed mb-12 max-w-md">
             A poucos passos de distância, você encontra o Rio da Madre. Uma caminhada curta pela vila leva você aos melhores restaurantes e ao coração da cultura surfística da região.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        <div className="flex flex-col justify-center p-12 lg:p-24 bg-[#2C2A26] text-[#F5F2EB]">
           <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-6">Sustentabilidade</span>
           <h3 className="text-4xl md:text-5xl font-serif mb-8 text-[#F5F2EB] leading-tight">
             Respeito ao <br/> ecossistema.
           </h3>
           <p className="text-lg text-[#A8A29E] font-light leading-relaxed mb-12 max-w-md">
             Praticamos uma gestão consciente, com aquecimento solar, redução de plásticos de uso único e apoio aos artesãos e produtores orgânicos da região de Paulo Lopes e Palhoça.
           </p>
        </div>
        <div className="relative h-[500px] lg:h-auto overflow-hidden group">
           <img 
             src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&q=80&w=1200" 
             alt="Natureza preservada" 
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 brightness-90"
           />
        </div>
      </div>
    </section>
  );
};

export default About;
