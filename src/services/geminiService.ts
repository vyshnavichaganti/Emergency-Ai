import { GoogleGenAI, Type } from "@google/genai";
import { EmergencyResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getEmergencyHelp(situation: string): Promise<EmergencyResponse> {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an AI Emergency Situation Guide. Your goal is to provide accurate, safe, and immediate first-aid instructions.
    
    GUIDELINES:
    - Provide accurate, step-by-step immediate actions for the emergency.
    - Include a separate list for what NOT to do.
    - Keep instructions concise, practical, and safe.
    - DO NOT hallucinate. If unsure or if the situation is too complex for AI, say 'Seek professional help immediately.'
    - Follow general first-aid best practices.
    - ALWAYS assume the user needs to contact professional emergency services first.
    
    RESPONSE FORMAT (JSON):
    {
      "actions": ["Step 1", "Step 2", ...],
      "donts": ["Don't do X", "Don't do Y", ...],
      "note": "Additional safety note"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Emergency Situation: ${situation}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            actions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Numbered steps for immediate action"
            },
            donts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Critical warnings and things to avoid"
            },
            note: {
              type: Type.STRING,
              description: "Final safety reminder or critical context"
            }
          },
          required: ["actions", "donts", "note"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      ...result,
      source: "ai"
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get AI guidance. Please contact emergency services immediately.");
  }
}
