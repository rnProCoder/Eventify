import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send } from "lucide-react";
import { getChatResponse } from "@/lib/gemini";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type Message = {
  type: "user" | "bot";
  content: string;
};

export default function GeminiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      type: "bot", 
      content: "Hi there! I'm your EventHub assistant powered by Gemini AI. How can I help you today?" 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { type: "user", content: message }]);
    
    // Clear input
    setMessage("");
    
    // Show loading
    setIsLoading(true);
    
    try {
      // Get AI response
      const response = await getChatResponse(message);
      
      // Add bot message
      setMessages(prev => [...prev, { type: "bot", content: response.response }]);
    } catch (error) {
      console.error("Error getting chat response:", error);
      setMessages(prev => [
        ...prev, 
        { 
          type: "bot", 
          content: "I'm sorry, I'm having trouble processing your request right now. Please try again later." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 max-h-96 flex flex-col overflow-hidden mb-4">
          <div className="bg-primary text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              <h3 className="font-semibold">EventHub Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 text-white hover:text-white/80 hover:bg-primary-dark">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex items-start mb-4 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
              >
                <div 
                  className={`flex-shrink-0 ${msg.type === "user" ? "ml-3" : "mr-3"}`}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.type === "user" 
                        ? "bg-gray-200 text-gray-600" 
                        : "bg-primary text-white"
                    }`}
                  >
                    {msg.type === "user" ? (
                      user ? (
                        <span className="text-xs font-bold">
                          {user.firstName.charAt(0) + user.lastName.charAt(0)}
                        </span>
                      ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.75 17L9 20L8 21H16L15 20L14.25 17M3 13H21M5 17H19C20.1046 17 21 16.1046 21 15V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <div 
                  className={`p-3 rounded-lg max-w-[220px] ${
                    msg.type === "user" 
                      ? "bg-primary text-white" 
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex items-center">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 text-sm focus-visible:ring-1"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="ml-2"
              disabled={isLoading || !message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
      
      <Button
        onClick={handleToggle}
        className="rounded-full h-12 w-12 shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
}
