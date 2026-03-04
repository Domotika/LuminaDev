
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
  onAddToCart: (product: Product) => void;
}

const CalendarView: React.FC<{ product: Product; onBack: () => void }> = ({ product, onBack }) => {
  // Simulação de dias ocupados (aleatório para demonstração)
  const days = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    isOccupied: Math.random() > 0.7,
    isToday: i + 1 === new Date().getDate()
  }));

  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const currentMonth = months[new Date().getMonth()];

  return (
    <div className="animate-fade-in-up">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#7895B2] mb-6 hover:opacity-70 transition-opacity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar para Escolha
      </button>
      
      <div className="bg-white p-6 border border-[#D6D1C7] mb-6">
        <h3 className="font-serif text-lg text-[#2C2A26] mb-1">{product.name}</h3>
        <p className="text-xs text-[#A8A29E] uppercase tracking-widest mb-6">Disponibilidade • {currentMonth} 2025</p>
        
        <div className="grid grid-cols-7 gap-2 mb-6">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-[#A8A29E]">{d}</div>
          ))}
          {days.map(d => (
            <div 
              key={d.day} 
              className={`aspect-square flex items-center justify-center text-xs transition-colors border
                ${d.isOccupied ? 'bg-[#EBE7DE] text-[#A8A29E] border-transparent cursor-not-allowed line-through' : 'bg-white text-[#3E3E3E] border-[#F5F2EB] hover:border-[#7895B2] cursor-pointer'}
                ${d.isToday ? 'ring-1 ring-[#7895B2] font-bold' : ''}
              `}
              title={d.isOccupied ? 'Ocupado' : 'Disponível'}
            >
              {d.day}
            </div>
          ))}
        </div>

        <div className="flex gap-4 text-[10px] uppercase tracking-widest font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border border-[#F5F2EB]"></div>
            <span>Livre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#EBE7DE]"></div>
            <span>Ocupado</span>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-[#5D5A53] italic leading-relaxed">
        * As datas riscadas já possuem reservas confirmadas. Entre em contato para períodos específicos.
      </p>
    </div>
  );
};

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemoveItem, onCheckout, onAddToCart }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Suíte');
  const [viewingCalendar, setViewingCalendar] = useState<Product | null>(null);
  
  const categories = ['Suíte', 'Apartamento', 'Bangalô'];
  const total = items.reduce((sum, item) => sum + item.price, 0);

  const filteredProducts = PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#2C2A26]/30 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => {
          setViewingCalendar(null);
          onClose();
        }}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[480px] bg-[#FDFBF7] z-[70] shadow-2xl transform transition-transform duration-500 ease-in-out border-l border-[#D6D1C7] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-[#D6D1C7]">
          <div className="flex flex-col">
            <h2 className="text-2xl font-serif text-[#3E3E3E]">Sua Reserva</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#A8A29E] mt-1">Guarda do Embaú • SC</p>
          </div>
          <button 
            onClick={() => {
              setViewingCalendar(null);
              onClose();
            }} 
            className="text-[#A8A29E] hover:text-[#3E3E3E] transition-colors p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {viewingCalendar ? (
            <CalendarView product={viewingCalendar} onBack={() => setViewingCalendar(null)} />
          ) : (
            <div className="space-y-10">
              {/* Category Selection */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-6">Categorias</span>
                <div className="flex gap-4 border-b border-[#EBE7DE] pb-4 overflow-x-auto no-scrollbar">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap px-4 py-2 transition-all ${
                        activeCategory === cat 
                          ? 'bg-[#7895B2] text-white shadow-md' 
                          : 'text-[#A8A29E] hover:text-[#3E3E3E]'
                      }`}
                    >
                      {cat}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Apartment List for selected category */}
              <div className="space-y-6">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8A29E]">Disponíveis para Escolha</span>
                {filteredProducts.map(product => (
                  <div key={product.id} className="group border border-[#EBE7DE] bg-white p-4 transition-all hover:border-[#7895B2]/40 hover:shadow-sm">
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 flex-shrink-0 overflow-hidden">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-serif text-[#3E3E3E] text-base mb-1">{product.name}</h4>
                        <span className="text-xs font-medium text-[#7895B2]">R$ {product.price} <span className="text-[10px] font-light text-[#A8A29E]">/ noite</span></span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setViewingCalendar(product)}
                        className="flex items-center justify-center gap-2 py-2 text-[9px] font-bold uppercase tracking-widest border border-[#D6D1C7] text-[#5D5A53] hover:bg-[#FDFBF7] transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        Calendário
                      </button>
                      <button 
                        onClick={() => onAddToCart(product)}
                        className="flex items-center justify-center py-2 text-[9px] font-bold uppercase tracking-widest bg-[#3E3E3E] text-white hover:bg-[#7895B2] transition-all"
                      >
                        Selecionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Section */}
              {items.length > 0 && (
                <div className="pt-10 border-t border-[#D6D1C7] animate-fade-in-up">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-6">Sua Seleção</span>
                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex items-center justify-between bg-[#EBE7DE]/30 p-4 border-l-2 border-[#7895B2]">
                        <div className="flex flex-col">
                          <span className="font-serif text-sm text-[#3E3E3E]">{item.name}</span>
                          <span className="text-[10px] font-bold text-[#7895B2] uppercase tracking-widest">R$ {item.price}</span>
                        </div>
                        <button 
                          onClick={() => onRemoveItem(idx)}
                          className="text-[#A8A29E] hover:text-red-400 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-[#F5F2EB] border-t border-[#D6D1C7]">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5D5A53]">Total Previsto</span>
            <span className="text-2xl font-serif text-[#3E3E3E]">R$ {total}</span>
          </div>
          <button 
            onClick={onCheckout}
            disabled={items.length === 0}
            className="w-full py-5 bg-[#3E3E3E] text-white uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#7895B2] shadow-xl transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed group"
          >
            Finalizar Reserva 
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 inline-block ml-3 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
          <p className="text-[9px] text-center text-[#A8A29E] mt-4 uppercase tracking-widest font-medium">Pagamento processado com segurança</p>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
