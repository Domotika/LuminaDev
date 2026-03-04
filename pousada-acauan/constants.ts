
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Product, JournalArticle } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'a1',
    name: 'Suíte Master Acauan',
    tagline: 'O ápice do conforto.',
    description: 'Nossa suíte premium com varanda privativa e vista para o jardim.',
    longDescription: 'A Suíte Master oferece um ambiente amplo com cama king size, enxoval de alta gramatura e uma decoração que mescla o rústico com o moderno. Ideal para quem busca exclusividade.',
    price: 450,
    category: 'Suíte',
    imageUrl: 'https://i.ibb.co/jvDWWRpm/521682003.jpg',
    features: ['Ar Condicionado', 'Cama King Size', 'Varanda Privativa', 'Café no Quarto']
  },
  {
    id: 'a2',
    name: 'Apartamento Standard',
    tagline: 'Simplicidade e aconchego.',
    description: 'Perfeito para relaxar após um dia inteiro de praia.',
    longDescription: 'Um espaço otimizado com decoração leve, cama de casal confortável e fácil acesso a todas as áreas comuns da pousada.',
    price: 320,
    category: 'Apartamento',
    imageUrl: 'https://i.ibb.co/C5DT7qm8/515141479.jpg',
    features: ['Wi-Fi 5G', 'Cama de Casal', 'Frigobar', 'Ducha Aquecida']
  },
  {
    id: 'a3',
    name: 'Bangalô Família',
    tagline: 'Para momentos compartilhados.',
    description: 'Espaço amplo para até 4 pessoas com dois ambientes.',
    longDescription: 'O Bangalô Família oferece privacidade para os parents e conforto para os filhos, com uma pequena área de estar integrada.',
    price: 680,
    category: 'Bangalô',
    imageUrl: 'https://i.ibb.co/nNDPnYgv/Gemini-Generated-Image-gl8aq7gl8aq7gl8a.png',
    features: ['2 Ambientes', 'Acomoda 4 pessoas', 'Copa de Apoio', 'Pet Friendly']
  },
  {
    id: 'a4',
    name: 'Suíte Vista Mar',
    tagline: 'Acorde com o horizonte.',
    description: 'Localizada no ponto mais alto, com brisa constante.',
    longDescription: 'Uma suíte romântica desenhada para casais, com janelas amplas que permitem a entrada da luz natural e o som constante do mar.',
    price: 520,
    category: 'Suíte',
    imageUrl: 'https://i.ibb.co/qLn5pRbq/521682605.jpg',
    features: ['Vista Mar', 'Rede na Varanda', 'Decoração Praiana', 'Smart TV']
  },
  {
    id: 'a5',
    name: 'Estúdio Caiçara',
    tagline: 'Alma local.',
    description: 'Decoração inspirada na cultura dos pescadores da Guarda.',
    longDescription: 'Um estúdio charmoso com artesanato local, móveis de madeira de demolição e uma atmosfera autêntica da vila.',
    price: 380,
    category: 'Apartamento',
    imageUrl: 'https://i.ibb.co/jPMQpGKW/Gemini-Generated-Image-t83bh6t83bh6t83b.png',
    features: ['Artesanato Local', 'Cozinha Básica', 'Ventilação Natural', 'Wi-Fi']
  },
  {
    id: 'a6',
    name: 'Loft do Costão',
    tagline: 'Design e Natureza.',
    description: 'Modernidade integrada ao ambiente de preservação.',
    longDescription: 'Para quem busca um design contemporâneo sem abrir mão do contato com a natureza da Guarda do Embaú.',
    price: 590,
    category: 'Bangalô',
    imageUrl: 'https://i.ibb.co/CKVs70Wn/Gemini-Generated-Image-8115v18115v18115.png',
    features: ['Design Moderno', 'Banheiro Panorâmico', 'Ar Condicionado', 'Frigobar Gourmet']
  }
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
    {
        id: 1,
        title: "As Ondas da Guarda",
        date: "Esporte",
        excerpt: "Por que somos considerados uma das melhores praias de surf do Brasil.",
        image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=1000",
        content: React.createElement(React.Fragment, null,
            React.createElement("p", { className: "mb-6 text-[#5D5A53]" },
                "A Guarda do Embaú não é apenas uma praia, é um santuário. Suas ondas perfeitas atraem surfistas de todo o mundo, mantendo uma cultura de respeito e preservação única no litoral catarinense."
            )
        )
    },
    {
        id: 2,
        title: "Trilhas e Mirantes",
        date: "Natureza",
        excerpt: "Um guia pelas paisagens intocadas ao redor da Pousada Acauan.",
        image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=1000",
        content: React.createElement(React.Fragment, null,
            React.createElement("p", { className: "mb-6 text-[#5D5A53]" },
                "Explore o Costão da Guarda e a Prainha. Caminhadas leves que revelam a magnitude da nossa costa, com paradas obrigatórias para fotos inesquecíveis."
            )
        )
    }
];

export const BRAND_NAME = 'Pousada Acauan';
export const PRIMARY_COLOR = 'stone-900'; 
export const ACCENT_COLOR = 'blue-400';
