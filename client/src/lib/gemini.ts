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
    context += "Keep your responses concise, helpful, and related to event management.\n\n";
    
    // Provide information about current events
    context += "Here are the current events on the platform:\n";
    context += "1. Tech Innovation Hackathon 2023 - A 48-hour coding competition in New York, NY (August 15-16, 2023)\n";
    context += "2. AI for Beginners Workshop - A hands-on workshop in San Francisco, CA (July 28, 2023)\n";
    context += "3. Future of Web Development - A seminar in Chicago, IL (September 5, 2023)\n";
    context += "4. Data Science Conference 2023 - A conference in Boston, MA (October 15-17, 2023)\n";
    context += "5. Mobile App Development Bootcamp - A workshop in Austin, TX (July 20-22, 2023)\n";
    context += "6. Blockchain Innovation Summit - A conference in Miami, FL (November 10-12, 2023)\n";
    context += "7. Women in Tech Networking Mixer - A networking event in Seattle, WA (August 28, 2023)\n";
    context += "8. UI/UX Design Workshop - A workshop in Portland, OR (September 15-16, 2023)\n";
    context += "9. Cybersecurity Seminar - A seminar in Washington, DC (August 10, 2023)\n";
    context += "10. Global Innovation Hackathon - A virtual hackathon (November 25-26, 2023)\n";

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
