import { Request, Response, NextFunction } from "express";
import {
  EventService,
  CreateEventInput,
  UpdateEventInput,
} from "../services/event.service";
import { AppError } from "../middleware/error";

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  /**
   * Create a new event
   */
  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventData: CreateEventInput = req.body;

      // Validate required fields
      if (!eventData.title || !eventData.date) {
        throw new AppError("Title and date are required", 400);
      }

      // Convert string date to Date object if needed
      if (typeof eventData.date === "string") {
        eventData.date = new Date(eventData.date);
      }

      const event = await this.eventService.createEvent(eventData);

      res.status(201).json({
        status: "success",
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all events
   */
  getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.query;
      const events = await this.eventService.getAllEvents(
        category as string | undefined
      );

      res.status(200).json({
        status: "success",
        results: events.length,
        data: { events },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get event by ID
   */
  getEventById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const event = await this.eventService.getEventById(id);

      res.status(200).json({
        status: "success",
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an event
   */
  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const eventData: UpdateEventInput = req.body;

      // Convert string date to Date object if needed
      if (eventData.date && typeof eventData.date === "string") {
        eventData.date = new Date(eventData.date);
      }

      const event = await this.eventService.updateEvent(id, eventData);

      res.status(200).json({
        status: "success",
        data: { event },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete an event
   */
  deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.eventService.deleteEvent(id);

      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel an event and all related bookings
   */
  cancelEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const event = await this.eventService.cancelEvent(id);

      res.status(200).json({
        status: "success",
        data: {
          event,
          message: "Event and all related bookings have been cancelled",
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search events
   */
  searchEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req.query;

      if (!query) {
        throw new AppError("Search query is required", 400);
      }

      const events = await this.eventService.searchEvents(query as string);

      res.status(200).json({
        status: "success",
        results: events.length,
        data: { events },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all events with admin privileges (includes events of all statuses)
   */
  getAdminEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = "1",
        limit = "10",
        status,
        startDate,
        endDate,
        searchTerm,
        sortBy = "date",
        sortDirection = "desc",
      } = req.query;

      const parsedPage = parseInt(page as string, 10);
      const parsedLimit = parseInt(limit as string, 10); // Create query options
      const options = {
        sortBy: sortBy as string,
        sortDirection: sortDirection as "asc" | "desc",
        status: status as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        searchTerm: searchTerm as string | undefined,
      };

      const events = await this.eventService.getAdminEvents(options);

      res.status(200).json({
        status: "success",
        data: {
          events,
          pagination: {
            total: events.length,
            page: parsedPage,
            limit: parsedLimit,
            totalPages: Math.ceil(events.length / parsedLimit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export events to CSV
   */
  exportEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, startDate, endDate, searchTerm } = req.query;
      const options = {
        status: status as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        searchTerm: searchTerm as string | undefined,
      };

      const events = await this.eventService.exportEvents();

      // Convert events to CSV format
      const headers = [
        "ID",
        "Title",
        "Date",
        "Location",
        "Status",
        "Available Tickets",
      ];
      const csvRows = [
        headers.join(","),
        ...events.map((event) =>
          [
            event.id,
            `"${event.title.replace(/"/g, '""')}"`,
            event.date,
            `"${event.location?.replace(/"/g, '""') || ""}"`,
            event.status,
            event.available_tickets,
          ].join(",")
        ),
      ];
      const csv = csvRows.join("\r\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=events-export-${
          new Date().toISOString().split("T")[0]
        }.csv`
      );

      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk update events status
   */
  bulkUpdateEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { ids, status } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError("Event IDs are required", 400);
      }
      if (!status || !["active", "inactive"].includes(status)) {
        throw new AppError("Valid status is required", 400);
      }

      const results = await this.eventService.bulkUpdateEvents(ids, status);
      res.status(200).json({
        status: "success",
        data: {
          updatedCount: results.successful,
          message: `${results.successful} events have been updated to ${status}`,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bulk delete events
   */
  bulkDeleteEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError("Event IDs are required", 400);
      }

      const results = await this.eventService.bulkDeleteEvents(ids);
      res.status(200).json({
        status: "success",
        data: {
          deletedCount: results.successful,
          message: `${results.successful} events have been deleted`,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
