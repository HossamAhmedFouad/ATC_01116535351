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
}
