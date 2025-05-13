import prisma from "../prisma/client";
import { AppError } from "../middleware/error";
import { events } from "../generated/prisma";

export interface CreateEventInput {
  title: string;
  date: Date;
  location?: string;
  description?: string;
  image_url?: string;
  price?: number;
  category?: string;
  duration?: string;
  organizer?: string;
  available_tickets?: number;
  schedule?: Record<string, any>;
}

export interface UpdateEventInput {
  title?: string;
  date?: Date;
  location?: string;
  description?: string;
  image_url?: string;
  price?: number;
  category?: string;
  duration?: string;
  organizer?: string;
  available_tickets?: number;
  schedule?: Record<string, any>;
}

export class EventService {
  /**
   * Create a new event
   * @param eventData Event data
   * @returns The created event
   */ async createEvent(eventData: CreateEventInput) {
    try {
      // Convert price and available_tickets to BigInt
      return await prisma.events.create({
        data: {
          title: eventData.title,
          date:
            eventData.date instanceof Date
              ? eventData.date
              : new Date(eventData.date),
          location: eventData.location || null,
          description: eventData.description || null,
          image_url: eventData.image_url || null,
          price: eventData.price ? BigInt(eventData.price) : null,
          category: eventData.category || null,
          duration: eventData.duration || null,
          organizer: eventData.organizer || null,
          available_tickets: eventData.available_tickets
            ? BigInt(eventData.available_tickets)
            : null,
          schedule: eventData.schedule
            ? (eventData.schedule as any)
            : undefined,
        },
      });
    } catch (error) {
      console.error("Failed to create event:", error);
      throw new AppError("Failed to create event", 400);
    }
  }

  /**
   * Get all events with optional filtering
   * @param category Optional category filter
   * @returns List of events
   */
  async getAllEvents(category?: string) {
    const where = category ? { category } : {};
    return await prisma.events.findMany({ where });
  }

  /**
   * Get event by ID
   * @param eventId Event ID
   * @returns Event details
   */
  async getEventById(eventId: string) {
    const event = await prisma.events.findUnique({
      where: { id: BigInt(eventId) },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    return event;
  }

  /**
   * Update an event
   * @param eventId Event ID
   * @param eventData Updated event data
   * @returns Updated event
   */ async updateEvent(eventId: string, eventData: UpdateEventInput) {
    try {
      // Prepare data with proper type conversions
      const updateData: any = {};

      // Add only provided fields to the update data
      if (eventData.title !== undefined) updateData.title = eventData.title;
      if (eventData.location !== undefined)
        updateData.location = eventData.location;
      if (eventData.description !== undefined)
        updateData.description = eventData.description;
      if (eventData.image_url !== undefined)
        updateData.image_url = eventData.image_url;
      if (eventData.category !== undefined)
        updateData.category = eventData.category;
      if (eventData.duration !== undefined)
        updateData.duration = eventData.duration;
      if (eventData.organizer !== undefined)
        updateData.organizer = eventData.organizer;

      // Convert numeric values to BigInt
      if (eventData.price !== undefined) {
        updateData.price = BigInt(eventData.price);
      }
      if (eventData.available_tickets !== undefined) {
        updateData.available_tickets = BigInt(eventData.available_tickets);
      }

      // Handle date conversion
      if (eventData.date) {
        updateData.date =
          eventData.date instanceof Date
            ? eventData.date
            : new Date(eventData.date);
      }

      // Handle JSON data
      if (eventData.schedule !== undefined) {
        updateData.schedule = eventData.schedule as any;
      }

      return await prisma.events.update({
        where: { id: BigInt(eventId) },
        data: updateData,
      });
    } catch (error) {
      console.error("Failed to update event:", error);
      throw new AppError("Failed to update event", 400);
    }
  }

  /**
   * Delete an event
   * @param eventId Event ID
   */
  async deleteEvent(eventId: string) {
    try {
      await prisma.events.delete({
        where: { id: BigInt(eventId) },
      });
    } catch (error) {
      throw new AppError("Failed to delete event", 400);
    }
  }

  /**
   * Search events by title or description
   * @param query Search query
   * @returns Matching events
   */
  async searchEvents(query: string) {
    return await prisma.events.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    });
  }
}
