
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { BRAND_NAME } from '../constants';

interface NavbarProps {
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

const Logo: React.FC<{ scrolled: boolean }> = ({ scrolled }) => (
  <div className="flex items-center gap-4 group">
    <div className="relative">
      <svg 
        viewBox="0 0 100 100" 
        className={`w-14 h-14 transition-all duration-500 ${scrolled ? 'fill-[#7895B2]' : 'fill-white'}`}
      >
        {/* Círculo Principal - Tamanho Padrão */}
        <circle cx="50" cy="50" r="48.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        
        {/* Elementos internos do Logo Acauan original */}
        <circle cx="50" cy="24" r="5" />
        
        <path d="M34 66 Q34 38 48 38 M34 66 Q20 55 16 45 M34 66 Q20 66 16 71" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="34" y1="66" x2="34" y2="82" stroke="currentColor" strokeWidth="1.8" />
        
        <path d="M66 66 Q66 38 52 38 M66 66 Q80 55 84 45 M66 66 Q80 66 84 71" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="66" y1="66" x2="66" y2="82" stroke="currentColor" strokeWidth="1.8" />
        
        <path d="M40 76 Q45 58 58 54 Q63 52 63 49 Q63 46 60 46 Q58 46 58 49 Q54 68 40 76 Z" />
        <line x1="38" y1="76" x2="62" y2="76" stroke="currentColor" strokeWidth="2" />

        <text 
          x="50" 
          y="93" 
          textAnchor="middle" 
          fontSize="7.5" 
          className="font-sans font-bold tracking-[0.35em] uppercase"
        >
          ACAUAN
        </text>
      </svg>
    </div>
    <div className="flex flex-col">
      <span className={`hidden sm:block font-serif text-lg tracking-[0.1em] uppercase leading-none transition-colors duration-500 ${scrolled ? 'text-[#3E3E3E]' : 'text-white'}`}>
        Pousada
      </span>
      <span className={`hidden sm:block font-serif text-sm italic font-light tracking-widest transition-colors duration-500 ${scrolled ? 'text-[#7895B2]' : 'text-white/80'}`}>
        Acauan
      </span>
    </div>
  </div>
);

const Navbar: React.FC<NavbarProps> = ({ onNavClick, cartCount, onOpenCart }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setMobileMenuOpen(false);
    onNavClick(e, targetId);
  };

  const textColorClass = (scrolled || mobileMenuOpen) ? 'text-[#3E3E3E]' : 'text-white';

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${
          scrolled || mobileMenuOpen ? 'bg-[#FDFBF7]/95 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <a 
            href="#" 
            onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onNavClick(e, '');
            }}
            className="z-50 relative"
          >
            <Logo scrolled={scrolled || mobileMenuOpen} />
          </a>
          
          <div className={`hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${textColorClass}`}>
            <a href="#products" onClick={(e) => handleLinkClick(e, 'products')} className="hover:text-[#7895B2] transition-colors">Acomodações</a>
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:text-[#7895B2] transition-colors">A Pousada</a>
            <a href="#journal" onClick={(e) => handleLinkClick(e, 'journal')} className="hover:text-[#7895B2] transition-colors">Guia Local</a>
            <a href="#location" onClick={(e) => handleLinkClick(e, 'location')} className="hover:text-[#7895B2] transition-colors">Localização</a>
            <a 
              href="https://menudohospede.com.br/pousada-guarda" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-2 bg-[#7895B2]/10 hover:bg-[#7895B2] hover:text-white transition-all duration-500 rounded-sm"
            >
              Área do Hóspede
            </a>
          </div>

          <div className={`flex items-center gap-6 z-50 relative transition-colors duration-500 ${textColorClass}`}>
            <button 
              onClick={onOpenCart}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] border-2 px-5 py-2.5 transition-all hidden sm:block ${
                scrolled || mobileMenuOpen ? 'border-[#7895B2] text-[#7895B2] hover:bg-[#7895B2] hover:text-white' : 'border-white text-white hover:bg-white hover:text-[#7895B2]'
              }`}
            >
              Reservar ({cartCount})
            </button>
            
            <button 
              className={`block md:hidden focus:outline-none transition-colors duration-500 ${textColorClass}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
               {mobileMenuOpen ? (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                 </svg>
               )}
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-[#FDFBF7] z-40 flex flex-col justify-center items-center transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
      }`}>
          <div className="flex flex-col items-center space-y-10 text-xl font-serif font-medium text-[#3E3E3E]">
            <a href="#products" onClick={(e) => handleLinkClick(e, 'products')} className="hover:text-[#7895B2]">Acomodações</a>
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:text-[#7895B2]">A Pousada</a>
            <a href="#journal" onClick={(e) => handleLinkClick(e, 'journal')} className="hover:text-[#7895B2]">Guia Local</a>
            <a href="#location" onClick={(e) => handleLinkClick(e, 'location')} className="hover:text-[#7895B2]">Localização</a>
            <a 
              href="https://menudohospede.com.br/pousada-guarda" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#7895B2] font-sans text-xs font-bold uppercase tracking-[0.2em]"
            >
              Área do Hóspede
            </a>
            <button 
                onClick={(e) => { setMobileMenuOpen(false); onOpenCart(); }} 
                className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-[#7895B2] border-b border-[#7895B2] pb-2 mt-4"
            >
                Minhas Reservas ({cartCount})
            </button>
          </div>
      </div>
    </>
  );
};

export default Navbar;
