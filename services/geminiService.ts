
import { GoogleGenAI } from "@google/genai";
import { Resident, Package } from "../types";

export const generateNotificationMessage = async (pkg: Package, resident: Resident): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma mensagem curta, educada e profissional em português para o morador ${resident.name} do apartamento ${resident.apartment}, informando que uma encomenda da ${pkg.carrier} (${pkg.description}) chegou na portaria e está disponível para retirada. Use emojis apropriados de condomínio. Retorne apenas o texto da mensagem.`,
    });

    return response.text?.trim() || `Olá ${resident.name}, sua encomenda da ${pkg.carrier} chegou na portaria!`;
  } catch (error) {
    console.error("Error generating AI message:", error);
    return `Olá ${resident.name}, informamos que sua encomenda (${pkg.description}) da ${pkg.carrier} chegou e está disponível na portaria.`;
  }
};
