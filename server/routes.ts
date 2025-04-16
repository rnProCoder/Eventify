import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertEventSchema, 
  insertEventRegistrationSchema, 
  insertChatMessageSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Events routes
  // Get all events with optional filters
  app.get("/api/events", async (req, res, next) => {
    try {
      const { category, search, date, organizerId } = req.query;
      const filters: any = {};
      
      console.log("Raw event query params:", req.query);
      
      // Don't filter by "all" category, allow filtering by specific categories only
      if (category && category.toString() !== "all") {
        console.log("Setting category filter to:", category.toString());
        filters.category = category.toString();
      }
      
      if (search) filters.search = search.toString();
      if (date && date.toString() !== "all") filters.date = date.toString();
      if (organizerId) filters.organizerId = parseInt(organizerId.toString());
      
      console.log("Processed event filters:", filters);
      
      const events = await storage.getEvents(filters);
      
      if (filters.category) {
        console.log(`Found ${events.length} events with category '${filters.category}'`);
        console.log("Event categories in result:", events.map(e => e.category));
      }
      
      res.json(events);
    } catch (error) {
      console.error("Error processing events:", error);
      next(error);
    }
  });

  // Get a single event by ID
  app.get("/api/events/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      next(error);
    }
  });

  // Create a new event
  app.post("/api/events", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create an event" });
      }
      
      const userData = req.user as Express.User;
      if (userData.role !== "admin" && userData.role !== "organizer") {
        return res.status(403).json({ message: "Only organizers can create events" });
      }

      // Parse the raw data first to handle date conversions
      console.log("Creating event with data:", req.body);
      
      // Make sure dates are properly handled
      const eventData = {
        ...req.body,
        // Ensure dates are properly converted to Date objects
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        organizerId: userData.id
      };
      
      console.log("Parsed event data:", eventData);
      
      // Now validate with Zod schema
      const validatedData = insertEventSchema.parse(eventData);
      
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Event creation error:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Update an event
  app.put("/api/events/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update an event" });
      }
      
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const userData = req.user as Express.User;
      if (userData.role !== "admin" && event.organizerId !== userData.id) {
        return res.status(403).json({ message: "You don't have permission to update this event" });
      }
      
      // Only partial validation as this is an update
      const updateData = req.body;
      
      const updatedEvent = await storage.updateEvent(id, updateData);
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Delete an event
  app.delete("/api/events/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to delete an event" });
      }
      
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const userData = req.user as Express.User;
      if (userData.role !== "admin" && event.organizerId !== userData.id) {
        return res.status(403).json({ message: "You don't have permission to delete this event" });
      }
      
      await storage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Get event registrations
  app.get("/api/events/:id/registrations", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view registrations" });
      }
      
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const userData = req.user as Express.User;
      if (userData.role !== "admin" && event.organizerId !== userData.id) {
        return res.status(403).json({ message: "You don't have permission to view registrations for this event" });
      }
      
      const registrations = await storage.getEventRegistrations(eventId);
      res.json(registrations);
    } catch (error) {
      next(error);
    }
  });

  // Register for an event
  app.post("/api/events/:id/register", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to register for an event" });
      }
      
      const eventId = parseInt(req.params.id);
      const userData = req.user as Express.User;
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if already registered
      const isRegistered = await storage.isUserRegistered(eventId, userData.id);
      if (isRegistered) {
        return res.status(400).json({ message: "You are already registered for this event" });
      }
      
      // Check capacity
      const registrations = await storage.getEventRegistrations(eventId);
      if (registrations.length >= event.capacity) {
        return res.status(400).json({ message: "This event has reached its capacity" });
      }
      
      const registrationData = insertEventRegistrationSchema.parse({
        eventId,
        userId: userData.id
      });
      
      const registration = await storage.registerForEvent(registrationData);
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Cancel registration for an event
  app.delete("/api/events/:id/register", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to cancel registration" });
      }
      
      const eventId = parseInt(req.params.id);
      const userData = req.user as Express.User;
      
      const success = await storage.cancelRegistration(eventId, userData.id);
      
      if (!success) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Check if user is registered for an event
  app.get("/api/events/:id/is-registered", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.json({ isRegistered: false });
      }
      
      const eventId = parseInt(req.params.id);
      const userData = req.user as Express.User;
      
      const isRegistered = await storage.isUserRegistered(eventId, userData.id);
      res.json({ isRegistered });
    } catch (error) {
      next(error);
    }
  });

  // Get user's registered events
  app.get("/api/user/events", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view your registered events" });
      }
      
      const userData = req.user as Express.User;
      const registrations = await storage.getUserRegistrations(userData.id);
      
      // Get full event details for each registration
      const eventPromises = registrations.map(async (reg) => {
        return await storage.getEvent(reg.eventId);
      });
      
      const events = await Promise.all(eventPromises);
      const validEvents = events.filter(event => event !== undefined);
      
      res.json(validEvents);
    } catch (error) {
      next(error);
    }
  });

  // Get events organized by the user
  app.get("/api/user/organized-events", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view your organized events" });
      }
      
      const userData = req.user as Express.User;
      const events = await storage.getEvents({ organizerId: userData.id });
      
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  // Chatbot API with Gemini integration
  app.post("/api/chat", async (req, res, next) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Configure Gemini AI
      const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBvDq9LUcnC85vRE-JcR5DKHMor-Dt7-kc";
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Generate context for the AI
      let context = "You are an AI assistant for EventHub, an event management platform for hackathons, workshops, seminars, and conferences. ";
      context += "You help users with information about events, registration process, creating events, and general queries about the platform. ";
      context += "Keep your responses concise, helpful, and related to event management.\n\n";
      
      // Get all events and include them in the context
      const allEvents = await storage.getEvents();
      
      // Provide information about current events
      context += "Here are the current events on the platform:\n";
      allEvents.forEach((event, index) => {
        const dateInfo = event.startDate === event.endDate 
          ? new Date(event.startDate).toLocaleDateString() 
          : `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`;
        
        context += `${index + 1}. ${event.title} - A ${event.category} in ${event.location} (${dateInfo})\n`;
        context += `   Description: ${event.description.substring(0, 100)}...\n`;
      });
      
      // Store the chat message
      let chatData = {
        message,
        userId: req.isAuthenticated() ? (req.user as Express.User).id : undefined,
        response: ""
      };
      
      try {
        // Get response from Gemini
        const result = await model.generateContent(`${context}\n\nUser: ${message}`);
        const response = result.response.text();
        
        // Store the response
        chatData.response = response;
        
        // Save to storage
        const chatMessage = insertChatMessageSchema.parse(chatData);
        await storage.createChatMessage(chatMessage);
        
        res.json({ message, response });
      } catch (aiError) {
        console.error("Error with Gemini AI:", aiError);
        
        // Fallback response if AI fails
        const fallbackResponse = "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact support if you need immediate assistance.";
        chatData.response = fallbackResponse;
        
        // Still save the interaction with the fallback response
        const chatMessage = insertChatMessageSchema.parse(chatData);
        await storage.createChatMessage(chatMessage);
        
        res.json({ message, response: fallbackResponse });
      }
    } catch (error) {
      next(error);
    }
  });

  // Get chat history for the user
  app.get("/api/chat/history", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to view chat history" });
      }
      
      const userData = req.user as Express.User;
      const chatHistory = await storage.getUserChatHistory(userData.id);
      
      res.json(chatHistory);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
