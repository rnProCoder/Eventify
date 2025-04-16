import { users, type User, type InsertUser, events, type Event, type InsertEvent, eventRegistrations, type EventRegistration, type InsertEventRegistration, chatMessages, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getEvents(filters?: {
    category?: string;
    search?: string;
    date?: string;
    organizerId?: number;
  }): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event Registration operations
  registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration>;
  getEventRegistrations(eventId: number): Promise<EventRegistration[]>;
  getUserRegistrations(userId: number): Promise<EventRegistration[]>;
  cancelRegistration(eventId: number, userId: number): Promise<boolean>;
  isUserRegistered(eventId: number, userId: number): Promise<boolean>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserChatHistory(userId: number): Promise<ChatMessage[]>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private eventRegistrations: Map<number, EventRegistration>;
  private chatMessages: Map<number, ChatMessage>;
  private userIdCounter: number;
  private eventIdCounter: number;
  private eventRegistrationIdCounter: number;
  private chatMessageIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.eventRegistrations = new Map();
    this.chatMessages = new Map();
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.eventRegistrationIdCounter = 1;
    this.chatMessageIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 1 day
    });

    // Add an admin user by default (using plain password for development)
    this.createUser({
      username: "admin",
      password: "password123", // Plain password for development
      firstName: "Admin",
      lastName: "User",
      email: "admin@eventhub.com",
      role: "admin"
    });
    
    // Add an organizer user
    this.createUser({
      username: "organizer",
      password: "password123", // Plain password for development
      firstName: "Event",
      lastName: "Organizer",
      email: "organizer@eventhub.com",
      role: "organizer"
    });

    // Add some initial events
    this.createEvent({
      title: "Tech Innovation Hackathon 2023",
      description: "Join us for a 48-hour coding competition where talented developers, designers, and entrepreneurs collaborate to build innovative solutions.",
      category: "hackathon",
      location: "New York, NY",
      startDate: new Date("2023-08-15"),
      endDate: new Date("2023-08-16"),
      imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
      organizerId: 1,
      capacity: 250
    });

    this.createEvent({
      title: "AI for Beginners Workshop",
      description: "A hands-on workshop for beginners to learn the fundamentals of artificial intelligence and machine learning concepts.",
      category: "workshop",
      location: "San Francisco, CA",
      startDate: new Date("2023-07-28"),
      endDate: new Date("2023-07-28"),
      imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
      organizerId: 1,
      capacity: 120
    });

    this.createEvent({
      title: "Future of Web Development",
      description: "Industry experts share insights on the latest trends and future of web development technologies and best practices.",
      category: "seminar",
      location: "Chicago, IL",
      startDate: new Date("2023-09-05"),
      endDate: new Date("2023-09-05"),
      imageUrl: "https://images.unsplash.com/photo-1475721027785-f74ec9c2d4cb",
      organizerId: 1,
      capacity: 180
    });
    
    // Add 7 more events to reach 10 events total
    this.createEvent({
      title: "Data Science Conference 2023",
      description: "The premier conference for data scientists and analysts featuring workshops on the latest technologies and methodologies.",
      category: "conference",
      location: "Boston, MA",
      startDate: new Date("2023-10-15"),
      endDate: new Date("2023-10-17"),
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
      organizerId: 2,
      capacity: 500
    });

    this.createEvent({
      title: "Mobile App Development Bootcamp",
      description: "Intensive 3-day bootcamp for mobile developers to learn cutting-edge techniques for iOS and Android development.",
      category: "workshop",
      location: "Austin, TX",
      startDate: new Date("2023-07-20"),
      endDate: new Date("2023-07-22"),
      imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e",
      organizerId: 2,
      capacity: 60
    });

    this.createEvent({
      title: "Blockchain Innovation Summit",
      description: "Connect with blockchain enthusiasts and experts to explore the future of decentralized technologies.",
      category: "conference",
      location: "Miami, FL",
      startDate: new Date("2023-11-10"),
      endDate: new Date("2023-11-12"),
      imageUrl: "https://images.unsplash.com/photo-1639152201720-5e536d254d81",
      organizerId: 1,
      capacity: 350
    });

    this.createEvent({
      title: "Women in Tech Networking Mixer",
      description: "An evening of networking and mentorship opportunities for women in technology fields.",
      category: "networking",
      location: "Seattle, WA",
      startDate: new Date("2023-08-28"),
      endDate: new Date("2023-08-28"),
      imageUrl: "https://images.unsplash.com/photo-1528901166007-3784c7dd3653",
      organizerId: 2,
      capacity: 120
    });

    this.createEvent({
      title: "UI/UX Design Workshop",
      description: "Learn the principles of creating intuitive, user-friendly interfaces with hands-on design exercises.",
      category: "workshop",
      location: "Portland, OR",
      startDate: new Date("2023-09-15"),
      endDate: new Date("2023-09-16"),
      imageUrl: "https://images.unsplash.com/photo-1541462608143-67571c6738dd",
      organizerId: 2,
      capacity: 75
    });

    this.createEvent({
      title: "Cybersecurity Seminar",
      description: "Essential knowledge and best practices for protecting your organization against modern cyber threats.",
      category: "seminar",
      location: "Washington, DC",
      startDate: new Date("2023-08-10"),
      endDate: new Date("2023-08-10"),
      imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3",
      organizerId: 1,
      capacity: 200
    });

    this.createEvent({
      title: "Global Innovation Hackathon",
      description: "Teams from around the world compete to solve pressing global challenges through technology.",
      category: "hackathon",
      location: "Virtual Event",
      startDate: new Date("2023-11-25"),
      endDate: new Date("2023-11-26"),
      imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
      organizerId: 1,
      capacity: 1000
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEvents(filters?: {
    category?: string;
    search?: string;
    date?: string;
    organizerId?: number;
  }): Promise<Event[]> {
    let events = Array.from(this.events.values());

    if (filters) {
      if (filters.category) {
        events = events.filter(event => event.category === filters.category);
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        events = events.filter(
          event => 
            event.title.toLowerCase().includes(searchLower) || 
            event.description.toLowerCase().includes(searchLower) ||
            event.location.toLowerCase().includes(searchLower)
        );
      }

      if (filters.date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const thisWeekEnd = new Date(today);
        thisWeekEnd.setDate(thisWeekEnd.getDate() + (7 - today.getDay()));
        
        const nextWeekEnd = new Date(thisWeekEnd);
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
        
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        switch (filters.date) {
          case 'today':
            events = events.filter(event => {
              const eventStart = new Date(event.startDate);
              return (
                eventStart.getFullYear() === today.getFullYear() &&
                eventStart.getMonth() === today.getMonth() &&
                eventStart.getDate() === today.getDate()
              );
            });
            break;
          case 'tomorrow':
            events = events.filter(event => {
              const eventStart = new Date(event.startDate);
              return (
                eventStart.getFullYear() === tomorrow.getFullYear() &&
                eventStart.getMonth() === tomorrow.getMonth() &&
                eventStart.getDate() === tomorrow.getDate()
              );
            });
            break;
          case 'this-week':
            events = events.filter(event => {
              const eventDate = new Date(event.startDate);
              return eventDate >= today && eventDate <= thisWeekEnd;
            });
            break;
          case 'this-weekend':
            events = events.filter(event => {
              const eventDate = new Date(event.startDate);
              const dayOfWeek = eventDate.getDay();
              return (
                eventDate >= today && 
                eventDate <= thisWeekEnd && 
                (dayOfWeek === 0 || dayOfWeek === 6)
              );
            });
            break;
          case 'next-week':
            events = events.filter(event => {
              const eventDate = new Date(event.startDate);
              return eventDate > thisWeekEnd && eventDate <= nextWeekEnd;
            });
            break;
          case 'this-month':
            events = events.filter(event => {
              const eventDate = new Date(event.startDate);
              return eventDate >= today && eventDate <= thisMonthEnd;
            });
            break;
        }
      }

      if (filters.organizerId) {
        events = events.filter(event => event.organizerId === filters.organizerId);
      }
    }

    return events;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const createdAt = new Date();
    const newEvent: Event = { ...event, id, createdAt };
    this.events.set(id, newEvent);
    return newEvent;
  }

  async updateEvent(id: number, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    
    if (!event) {
      return undefined;
    }
    
    const updatedEvent: Event = { ...event, ...eventUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Event Registration operations
  async registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration> {
    const id = this.eventRegistrationIdCounter++;
    const registeredAt = new Date();
    const newRegistration: EventRegistration = { ...registration, id, registeredAt };
    this.eventRegistrations.set(id, newRegistration);
    return newRegistration;
  }

  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values())
      .filter(registration => registration.eventId === eventId);
  }

  async getUserRegistrations(userId: number): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values())
      .filter(registration => registration.userId === userId);
  }

  async cancelRegistration(eventId: number, userId: number): Promise<boolean> {
    const registration = Array.from(this.eventRegistrations.values())
      .find(reg => reg.eventId === eventId && reg.userId === userId);
    
    if (registration) {
      return this.eventRegistrations.delete(registration.id);
    }
    
    return false;
  }

  async isUserRegistered(eventId: number, userId: number): Promise<boolean> {
    return Array.from(this.eventRegistrations.values())
      .some(reg => reg.eventId === eventId && reg.userId === userId);
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageIdCounter++;
    const createdAt = new Date();
    const newMessage: ChatMessage = { ...message, id, createdAt };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async getUserChatHistory(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.userId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export const storage = new MemStorage();
