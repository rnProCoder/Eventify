
import { MongoClient, ObjectId } from 'mongodb';
import type { IStorage } from './storage';
import type { User, Event, EventRegistration, ChatMessage, InsertUser, InsertEvent, InsertEventRegistration, InsertChatMessage } from '@shared/schema';
import session from 'express-session';
import createMemoryStore from 'memorystore';

const MemoryStore = createMemoryStore(session);

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: any;
  sessionStore: session.SessionStore;

  constructor() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    this.client = new MongoClient(uri);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000
    });
    this.connect();
  }

  private async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await this.db.collection('users').findOne({ id });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.db.collection('users').findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    });
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.db.collection('users').findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = await this.getNextId('users');
    const newUser = { ...user, id, createdAt: new Date() };
    await this.db.collection('users').insertOne(newUser);
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return await this.db.collection('users').find().toArray();
  }

  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    const event = await this.db.collection('events').findOne({ id });
    return event || undefined;
  }

  async getEvents(filters?: {
    category?: string;
    search?: string;
    date?: string;
    organizerId?: number;
  }): Promise<Event[]> {
    const query: any = {};
    
    if (filters) {
      if (filters.category) query.category = filters.category;
      if (filters.organizerId) query.organizerId = filters.organizerId;
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { location: { $regex: filters.search, $options: 'i' } }
        ];
      }
      // Date filtering logic can be implemented here
    }
    
    return await this.db.collection('events').find(query).toArray();
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = await this.getNextId('events');
    const newEvent = { ...event, id, createdAt: new Date() };
    await this.db.collection('events').insertOne(newEvent);
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await this.db.collection('events').findOneAndUpdate(
      { id },
      { $set: event },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await this.db.collection('events').deleteOne({ id });
    return result.deletedCount === 1;
  }

  // Event Registration operations
  async registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration> {
    const id = await this.getNextId('registrations');
    const newRegistration = { ...registration, id, registeredAt: new Date() };
    await this.db.collection('registrations').insertOne(newRegistration);
    return newRegistration;
  }

  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return await this.db.collection('registrations')
      .find({ eventId })
      .toArray();
  }

  async getUserRegistrations(userId: number): Promise<EventRegistration[]> {
    return await this.db.collection('registrations')
      .find({ userId })
      .toArray();
  }

  async cancelRegistration(eventId: number, userId: number): Promise<boolean> {
    const result = await this.db.collection('registrations')
      .deleteOne({ eventId, userId });
    return result.deletedCount === 1;
  }

  async isUserRegistered(eventId: number, userId: number): Promise<boolean> {
    const registration = await this.db.collection('registrations')
      .findOne({ eventId, userId });
    return !!registration;
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = await this.getNextId('chat_messages');
    const newMessage = { ...message, id, createdAt: new Date() };
    await this.db.collection('chat_messages').insertOne(newMessage);
    return newMessage;
  }

  async getUserChatHistory(userId: number): Promise<ChatMessage[]> {
    return await this.db.collection('chat_messages')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  private async getNextId(collection: string): Promise<number> {
    const counter = await this.db.collection('counters').findOneAndUpdate(
      { _id: collection },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    return counter.seq;
  }
}
