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
  status?: "active" | "inactive";
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
  status?: "active" | "inactive";
}

export class EventService {
  /**
   * Create a new event
   * @param eventData Event data
   * @returns The created event
   */
  async createEvent(eventData: CreateEventInput) {
    try {
      // Map status to available_tickets if needed
      let availableTickets = eventData.available_tickets;
      if (eventData.status) {
        switch (eventData.status) {
          case "inactive":
            availableTickets = 0;
            break;
        }
      }

      return await prisma.events.create({
        data: {
          title: eventData.title,
          date: eventData.date,
          location: eventData.location || "",
          description: eventData.description || "",
          image_url: eventData.image_url || "",
          price: eventData.price !== undefined ? eventData.price : 0,
          category: eventData.category || "General",
          duration: eventData.duration || "2 hours",
          organizer: eventData.organizer || "Event System",
          available_tickets:
            availableTickets !== undefined ? availableTickets : 100,
          schedule: eventData.schedule || {},
        },
      });
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  /**
   * Get all events
   * @param categoryFilter Optional category filter
   * @returns List of events
   */
  async getAllEvents(categoryFilter?: string) {
    try {
      const where: any = {
        available_tickets: {
          gt: 0, // Only active & available events
        },
      };

      if (categoryFilter) {
        where.category = categoryFilter;
      }

      const events = await prisma.events.findMany({
        where,
        orderBy: {
          date: "asc",
        },
      });

      return events.map((event) => this.mapStatusFromAvailableTickets(event));
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  /**
   * Get event by ID
   * @param id Event ID
   * @returns Event or null if not found
   */
  async getEventById(id: string) {
    try {
      const event = await prisma.events.findUnique({
        where: { id },
      });

      if (!event) {
        return null;
      }

      return this.mapStatusFromAvailableTickets(event);
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update an event
   * @param id Event ID
   * @param eventData Updated event data
   * @returns Updated event
   */
  async updateEvent(id: string, eventData: UpdateEventInput) {
    try {
      // Find the event first
      const existingEvent = await prisma.events.findUnique({
        where: { id },
      });

      if (!existingEvent) {
        throw new AppError("Event not found", 404);
      }

      // Prepare update data
      const updateData: any = {};

      if (eventData.title !== undefined) {
        updateData.title = eventData.title;
      }

      if (eventData.date !== undefined) {
        updateData.date = eventData.date;
      }

      if (eventData.location !== undefined) {
        updateData.location = eventData.location;
      }

      if (eventData.description !== undefined) {
        updateData.description = eventData.description;
      }

      if (eventData.image_url !== undefined) {
        updateData.image_url = eventData.image_url;
      }

      if (eventData.category !== undefined) {
        updateData.category = eventData.category;
      }

      if (eventData.duration !== undefined) {
        updateData.duration = eventData.duration;
      }

      if (eventData.organizer !== undefined) {
        updateData.organizer = eventData.organizer;
      }

      if (eventData.schedule !== undefined) {
        updateData.schedule = eventData.schedule;
      }

      if (eventData.price !== undefined) {
        updateData.price = eventData.price;
      }

      // Handle status by mapping to available_tickets
      if (eventData.status) {
        switch (eventData.status) {
          case "inactive":
            updateData.available_tickets = 0;
            break;
          case "active":
            // If active and available_tickets not provided, set to default
            if (eventData.available_tickets === undefined) {
              updateData.available_tickets = 100;
            }
            break;
        }
      }

      // If available_tickets is explicitly provided and status is not inactive, use it
      if (
        eventData.available_tickets !== undefined &&
        eventData.status !== "inactive"
      ) {
        updateData.available_tickets = eventData.available_tickets;
      }

      // Update status field
      if (eventData.status) {
        updateData.status = eventData.status;
      }

      // Perform the update
      const updatedEvent = await prisma.events.update({
        where: { id },
        data: updateData,
      });

      return this.mapStatusFromAvailableTickets(updatedEvent);
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  }
  /**
   * Delete an event
   * @param id Event ID
   * @returns Deleted event
   */
  async deleteEvent(id: string) {
    try {
      // Find the event first
      const existingEvent = await prisma.events.findUnique({
        where: { id },
      });

      if (!existingEvent) {
        throw new AppError("Event not found", 404);
      }

      // Delete the event
      const deletedEvent = await prisma.events.delete({
        where: { id },
      });

      return this.mapStatusFromAvailableTickets(deletedEvent);
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
  }
  /**
   * Cancel an event and all related bookings
   * @param id Event ID
   * @returns Cancelled event
   */
  async cancelEvent(id: string) {
    try {
      // Find the event first
      const existingEvent = await prisma.events.findUnique({
        where: { id },
      });

      if (!existingEvent) {
        throw new AppError("Event not found", 404);
      }

      // Update the event to set available tickets to 0 (which makes it inactive)
      const updatedEvent = await prisma.events.update({
        where: { id },
        data: {
          available_tickets: 0,
        },
      });

      // Mark all related bookings as cancelled
      await prisma.bookings.updateMany({
        where: { event_id: id },
        data: {
          status: "cancelled",
        },
      });

      return this.mapStatusFromAvailableTickets(updatedEvent);
    } catch (error) {
      console.error(`Error cancelling event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get events with admin filters
   * @param options Filter options
   * @returns Filtered list of events
   */
  async getAdminEvents(options: {
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    status?: string;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
  }) {
    try {
      const {
        sortBy = "date",
        sortDirection = "desc",
        status,
        startDate,
        endDate,
        searchTerm,
      } = options;

      // Build where clause
      const where: any = {}; // Handle status filter
      if (status === "active") {
        where.available_tickets = {
          gt: 0,
        };
      } else if (status === "inactive") {
        where.available_tickets = {
          lte: 0,
        };
      }

      // Handle date range
      if (startDate) {
        where.date = {
          ...(where.date || {}),
          gte: new Date(startDate),
        };
      }

      if (endDate) {
        where.date = {
          ...(where.date || {}),
          lte: new Date(endDate),
        };
      }

      // Handle search
      if (searchTerm) {
        where.OR = [
          {
            title: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            location: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ];
      }

      // Build order by
      const orderBy: any = {};
      orderBy[sortBy] = sortDirection;

      // Fetch events
      const events = await prisma.events.findMany({
        where,
        orderBy,
      });

      // Map database status to API status
      return events.map((event) => this.mapStatusFromAvailableTickets(event));
    } catch (error) {
      console.error("Error fetching admin events:", error);
      throw error;
    }
  }

  /**
   * Search events by term
   * @param searchTerm Search term
   * @returns List of matching events
   */
  async searchEvents(searchTerm: string) {
    try {
      const events = await prisma.events.findMany({
        where: {
          OR: [
            {
              title: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              location: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              category: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ], // Only include active events in search
          available_tickets: {
            gt: 0,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      return events.map((event) => this.mapStatusFromAvailableTickets(event));
    } catch (error) {
      console.error("Error searching events:", error);
      throw error;
    }
  }

  /**
   * Export events for admin
   * @returns All events in exportable format
   */
  async exportEvents() {
    try {
      const events = await prisma.events.findMany({
        orderBy: {
          date: "desc",
        },
      });

      return events.map((event) => {
        const mappedEvent = this.mapStatusFromAvailableTickets(event);
        return {
          ...mappedEvent,
          date: mappedEvent.date.toISOString().split("T")[0],
          created_at: mappedEvent.created_at.toISOString(),
          updated_at: mappedEvent.updated_at.toISOString(),
        };
      });
    } catch (error) {
      console.error("Error exporting events:", error);
      throw error;
    }
  }

  /**
   * Bulk update events status
   * @param ids List of event IDs
   * @param status New status
   * @returns Results of the bulk operation
   */
  async bulkUpdateEvents(ids: string[], status: string) {
    try {
      // Validate status
      if (!["active", "inactive"].includes(status)) {
        throw new AppError("Invalid status", 400);
      }

      // Map status to available_tickets value
      let availableTickets;
      if (status === "active") {
        availableTickets = 100; // Default value for active events
      } else {
        availableTickets = 0; // Inactive events
      }

      // Update each event
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const event = await prisma.events.update({
              where: { id },
              data: {
                available_tickets: availableTickets,
              },
            });
            return { id, success: true, event };
          } catch (error) {
            return { id, success: false, error: (error as Error).message };
          }
        })
      );

      return {
        total: ids.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      };
    } catch (error) {
      console.error("Error in bulk update:", error);
      throw error;
    }
  }

  /**
   * Bulk delete events
   * @param ids List of event IDs
   * @returns Results of the bulk operation
   */
  async bulkDeleteEvents(ids: string[]) {
    try {
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const event = await prisma.events.delete({
              where: { id },
            });
            return { id, success: true, event };
          } catch (error) {
            return { id, success: false, error: (error as Error).message };
          }
        })
      );

      return {
        total: ids.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      };
    } catch (error) {
      console.error("Error in bulk delete:", error);
      throw error;
    }
  }
  /**
   * Maps the database representation of status (stored in available_tickets)
   * to the API representation
   */
  private mapStatusFromAvailableTickets(event: any) {
    const availableTickets = event.available_tickets;

    // Determine status based on available_tickets value
    let status = availableTickets > 0 ? "active" : "inactive";

    return {
      ...event,
      status,
    };
  }
}
