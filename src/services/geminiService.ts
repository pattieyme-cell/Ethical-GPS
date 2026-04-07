
import { GoogleGenAI, Type } from "@google/genai";
import { DecisionAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export async function analyzeDecision(dilemma: string): Promise<DecisionAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze the following life dilemma and provide a balanced perspective from Logic, Emotion, and Ethics. 
    Dilemma: "${dilemma}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          logic: {
            type: Type.OBJECT,
            properties: {
              pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              cons: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["pros", "cons"]
          },
          emotion: {
            type: Type.OBJECT,
            properties: {
              impactOnSelf: { type: Type.STRING },
              impactOnOthers: { type: Type.STRING },
              primaryEmotions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["impactOnSelf", "impactOnOthers", "primaryEmotions"]
          },
          ethics: {
            type: Type.OBJECT,
            properties: {
              principles: { type: Type.STRING },
              moralWeight: { type: Type.STRING },
              ethicalAlignment: { type: Type.STRING }
            },
            required: ["principles", "moralWeight", "ethicalAlignment"]
          },
          consequences: {
            type: Type.OBJECT,
            properties: {
              shortTerm: { type: Type.ARRAY, items: { type: Type.STRING } },
              longTerm: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["shortTerm", "longTerm"]
          },
          books: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                author: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["title", "author", "reason"]
            }
          },
          recommendation: { type: Type.STRING }
        },
        required: ["logic", "emotion", "ethics", "consequences", "books", "recommendation"]
      },
      systemInstruction: `You are a neutral, wise life mentor. Your role is to help users navigate emotional confusion by breaking down problems into objective pieces.
      Do not be judgmental. Be empathetic yet analytical. 
      Focus on three cards: Logic (Pros/Cons), Emotion (How it feels for self/others), and Ethics (The moral principles at play).
      Also analyze potential short-term and long-term consequences of their possible choices.
      Recommend 1-2 psychological or ethical books specifically suited to their dilemma.
      Always end with a gentle, non-authoritative recommendation.`
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    const parsed = JSON.parse(text) as DecisionAnalysis;
    
    // Add explicitly requested books
    const standardBooks = [
      { title: "The Power of Your Subconscious Mind", author: "Joseph Murphy", reason: "Helps reframe subconscious limitations holding you back." },
      { title: "The Power of Now", author: "Eckhart Tolle", reason: "Provides perspective on staying present instead of worrying about the future." },
      { title: "Atomic Habits", author: "James Clear", reason: "Actionable advice on building small habits to achieve the outcome you want." }
    ];
    
    parsed.books = [...parsed.books, ...standardBooks];
    
    return parsed;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Analysis failed. Please try rephrasing your dilemma.");
  }
}
