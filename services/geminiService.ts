
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: {
      type: Type.STRING,
      description: "The name of the recipe."
    },
    ingredients: {
      type: Type.ARRAY,
      description: "A list of all ingredients needed for the recipe, including quantities and number of servings per person or container.",
      items: { type: Type.STRING }
    },
    instructions: {
      type: Type.ARRAY,
      description: "Step-by-step instructions to prepare the dish.",
      items: { type: Type.STRING }
    }
  },
  required: ["recipeName", "ingredients", "instructions"]
};

export async function generateRecipes(ingredients: string[]): Promise<Recipe[]> {
  const prompt = `
    You are a creative and experienced chef. Based on the following ingredients, generate 3 distinct and delicious recipes. 
    Assume the user has basic staples like salt, pepper, oil, and water.
    For each recipe, provide a catchy name, a list of all required ingredients (including the ones provided and any staples), and clear, step-by-step instructions.

    Available ingredients: ${ingredients.join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "A list of three unique recipes.",
          items: recipeSchema
        },
        temperature: 0.8,
        topP: 0.9,
      },
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
        throw new Error("Received an empty response from the AI. Please try again.");
    }
    const recipes = JSON.parse(jsonString);
    return recipes as Recipe[];

  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("Failed to generate recipes. The AI might be busy, please try again later.");
  }
}
