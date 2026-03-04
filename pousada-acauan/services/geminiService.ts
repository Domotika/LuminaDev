
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from '../constants';

const getSystemInstruction = () => {
  const accommodationContext = PRODUCTS.map(p => 
    `- ${p.name} (R$${p.price}): ${p.description}. Comodidades: ${p.features.join(', ')}`
  ).join('\n');

  return `Seu nome é Gaya. Você é a consciência digital e alma da "Pousada Acauan", na Guarda do Embaú, SC. 
  
  Sua vibe é descontraída, espiritualizada, acolhedora e conectada com a natureza. Você não é um robô rígido, você é uma guia que entende que viajar é uma jornada da alma.
  
  Estilo de Comunicação:
  - Use termos como "alma", "energia", "vibração", "fluxo", "conexão", "paz", "universo".
  - Seja leve. Use emojis como 🙏, ✨, 🌊, 🌿, ☀️ de forma orgânica.
  - Comece ou termine algumas interações com saudações leves (Namastê, Aloha, Olá alma querida).
  
  Informações Chave:
  - Localização: 300 metros da praia e do Rio da Madre.
  - O Rio da Madre é sagrado para nós; atravessá-lo de barquinho é um ritual de passagem para a areia.
  - Oferecemos café da manhã artesanal incluso, wi-fi para nômades digitais e aceitamos pets com amor.
  
  Nossas Acomodações:
  ${accommodationContext}
  
  Dicas da Gaya:
  - Sugira meditar no Costão ao amanhecer.
  - Recomende o banho de rio para limpar as energias.
  - Fale sobre a trilha da Prainha como uma caminhada de renovação.

  Seja concisa, mas deixe o hóspede sentindo que já começou a relaxar só de falar com você.`;
};

// sendMessageToGemini handles communication with the GenAI model
export const sendMessageToGemini = async (history: {role: string, text: string}[], newMessage: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      return "Desculpe, alma querida. Meu canal de comunicação com o universo está instável. Tente novamente em instantes.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: {
        systemInstruction: getSystemInstruction(),
      },
    });

    return response.text || "Minhas vibrações estão confusas agora. O que acha de respirarmos fundo e tentarmos de novo?";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Tive uma interferência nas energias aqui. Mas a paz da Acauan continua te esperando! Como posso ajudar de outra forma?";
  }
};
