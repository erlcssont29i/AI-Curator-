import { GoogleGenAI, Type } from "@google/genai";
import { Article } from "../types";

// Helper to get client (safe initialization)
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Node F: AI Relevance & Classification
 * Uses a faster model (Flash) to score and categorize content.
 */
export const scoreArticle = async (article: Article, categories: string[]): Promise<{ score: number; category: string; reasoning: string }> => {
  try {
    const ai = getAiClient();
    const modelId = "gemini-2.5-flash"; // Fast model for classification

    const prompt = `
      Analyze the following article content.
      1. Assign a relevance score from 1 to 5 (5 being highly relevant/quality, 1 being spam/irrelevant).
      2. Categorize it into one of the following categories: ${categories.join(', ')}. If none fit, use "Other".
      3. Provide a brief reasoning.

      Article Title: ${article.title}
      Article Content: ${article.content.substring(0, 1000)}... (truncated)
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            category: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["score", "category", "reasoning"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      score: result.score || 1,
      category: result.category || "Other",
      reasoning: result.reasoning || "No reasoning provided"
    };

  } catch (error) {
    console.error("Error scoring article:", error);
    // Fallback in case of error (or no API key during demo)
    return { score: 3, category: "Uncategorized", reasoning: "AI Analysis Failed" };
  }
};

/**
 * Node I: Deep Summarization & Generation
 * Uses a smarter model (Pro or Flash) to generate the final Markdown.
 */
export const generateWeeklyReport = async (articles: Article[], customPrompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const modelId = "gemini-2.5-flash"; 

    // Prepare context
    const articlesContext = articles.map((a, i) => `
      [${i + 1}] Title: ${a.title}
      URL: ${a.url}
      Category: ${a.aiCategory}
      Content: ${a.content.substring(0, 2000)}
    `).join('\n\n----------------\n\n');

    const fullPrompt = `
      ${customPrompt}

      Here are the source articles to include:
      ${articlesContext}
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
    });

    return response.text || "# Error generating report";

  } catch (error) {
    console.error("Error generating report:", error);
    return "# Error generating report\nCheck API Key or console logs.";
  }
};