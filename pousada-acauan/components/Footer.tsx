
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState } from 'react';
import { BRAND_NAME } from '../constants';

interface FooterProps {
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onLinkClick }) => {
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email) return;
    setSubscribeStatus('loading');
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <footer id="footer" className="bg-[#FDFBF7] pt-32 pb-16 px-6 text-[#5D5A53] border-t-4 border-[#7895B2]/20">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        
        <div className="lg:col-span-5">
          <div className="flex flex-col gap-4 mb-8">
            <h4 className="text-4xl font-serif text-[#7895B2] leading-none uppercase tracking-tighter">{BRAND_NAME}</h4>
            <div className="w-20 h-1 bg-[#7895B2]"></div>
          </div>
          <p className="max-w-md font-light leading-relaxed mb-10 text-lg">
            Um santuário costeiro na Guarda do Embaú, onde a hospitalidade encontra a natureza preservada de Santa Catarina.
          </p>
          <div className="text-sm font-medium text-[#3E3E3E] tracking-[0.1em] uppercase leading-loose p-6 border-l-2 border-[#7895B2]/40 bg-[#7895B2]/5 cursor-pointer hover:bg-[#7895B2]/10 transition-colors" onClick={(e) => onLinkClick(e as any, 'location')}>
            Servidão Pintado, 11 <br/>
            Guarda do Embaú, Palhoça - SC <br/>
            CEP: 88139-406
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="font-bold text-[#3E3E3E] mb-10 tracking-[0.3em] text-[10px] uppercase border-b border-[#D6D1C7] pb-4 inline-block">Menu</h4>
          <ul className="space-y-6 font-light text-xs uppercase tracking-[0.2em]">
            <li><a href="#products" onClick={(e) => onLinkClick(e, 'products')} className="hover:text-[#7895B2] transition-all hover:pl-2">Apartamentos</a></li>
            <li><a href="#about" onClick={(e) => onLinkClick(e, 'about')} className="hover:text-[#7895B2] transition-all hover:pl-2">A Pousada</a></li>
            <li><a href="#journal" onClick={(e) => onLinkClick(e, 'journal')} className="hover:text-[#7895B2] transition-all hover:pl-2">Guia da Vila</a></li>
            <li><a href="#location" onClick={(e) => onLinkClick(e, 'location')} className="hover:text-[#7895B2] transition-all hover:pl-2">Localização</a></li>
            <li><a href="https://menudohospede.com.br/pousada-guarda" target="_blank" rel="noopener noreferrer" className="hover:text-[#7895B2] transition-all hover:pl-2 text-[#7895B2] font-medium">Área do Hóspede</a></li>
          </ul>
        </div>
        
        <div className="lg:col-span-2">
          <h4 className="font-bold text-[#3E3E3E] mb-10 tracking-[0.3em] text-[10px] uppercase border-b border-[#D6D1C7] pb-4 inline-block">Explorar</h4>
          <ul className="space-y-6 font-light text-xs uppercase tracking-[0.2em]">
            <li><a href="#" className="hover:text-[#7895B2] transition-all hover:pl-2">Costão da Guarda</a></li>
            <li><a href="#" className="hover:text-[#7895B2] transition-all hover:pl-2">Trilha da Prainha</a></li>
            <li><a href="#" className="hover:text-[#7895B2] transition-all hover:pl-2">Surf Reports</a></li>
            <li><a href="#" className="hover:text-[#7895B2] transition-all hover:pl-2">Eventos locais</a></li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="font-bold text-[#3E3E3E] mb-10 tracking-[0.3em] text-[10px] uppercase border-b border-[#D6D1C7] pb-4 inline-block">Conectar</h4>
          <p className="text-xs mb-8 opacity-70 leading-relaxed uppercase tracking-widest">Inscreva-se para receber novidades da Guarda.</p>
          <div className="flex flex-col gap-6">
            <input 
              type="email" 
              placeholder="SEU MELHOR E-MAIL" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
              className="bg-transparent border-b-2 border-[#D6D1C7] py-3 text-xs outline-none focus:border-[#7895B2] transition-colors placeholder-[#A8A29E]/50 text-[#3E3E3E] tracking-widest uppercase disabled:opacity-50" 
            />
            <button 
              onClick={handleSubscribe}
              disabled={subscribeStatus !== 'idle' || !email}
              className="self-start text-[10px] font-bold uppercase tracking-[0.4em] py-4 px-8 bg-[#3E3E3E] text-white hover:bg-[#7895B2] disabled:opacity-50 transition-all duration-500"
            >
              {subscribeStatus === 'idle' && 'Cadastrar'}
              {subscribeStatus === 'loading' && 'Enviando...'}
              {subscribeStatus === 'success' && 'Bem-vindo'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto mt-32 pt-12 border-t border-[#EBE7DE] flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.5em] opacity-50">
        <p>&copy; 2025 {BRAND_NAME} — Guarda do Embaú - Palhoça - SC</p>
        <div className="flex gap-10 mt-8 md:mt-0 font-bold">
          <a href="#" className="hover:text-[#7895B2] transition-colors">Instagram</a>
          <a href="#" className="hover:text-[#7895B2] transition-colors">WhatsApp</a>
          <a href="https://www.google.com/maps/dir//Pousada+Acauan" target="_blank" rel="noopener" className="hover:text-[#7895B2] transition-colors">Direções</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
