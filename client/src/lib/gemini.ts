import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBvDq9LUcnC85vRE-JcR5DKHMor-Dt7-kc";
const genAI = new GoogleGenerativeAI(API_KEY);

// Function to call the Gemini API directly from the client
// Note: In production, it's better to use the server-side endpoint to protect the API key
export async function generateResponse(message: string): Promise<string> {
  try {
    // Configure the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Context for the AI
    let context = "You are an AI assistant for EventHub, an event management platform for hackathons, workshops, seminars, and conferences. ";
    context += "You help users with information about events, registration process, creating events, and general queries about the platform. ";
    context += "Keep your responses concise, helpful, and related to event management.";

    // Get response from Gemini
    const result = await model.generateContent(`${context}\n\nUser: ${message}`);
    return result.response.text();
  } catch (error) {
    console.error("Error generating Gemini response:", error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
}

// Alternative function that uses the server-side API
export async function getChatResponse(message: string): Promise<{ message: string; response: string }> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching chat response:", error);
    return {
      message,
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    };
  }
}
