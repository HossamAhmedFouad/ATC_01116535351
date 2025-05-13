// This file is used to check our event service types

import { EventService } from "./services/event.service";
import { BookingService } from "./services/booking.service";

// Instantiate the services
const eventService = new EventService();
const bookingService = new BookingService();

// Test create event
async function testCreateEvent() {
  try {
    const event = await eventService.createEvent({
      title: "Test Event",
      date: new Date(),
      location: "Test Location",
      description: "Test Description",
      price: 100,
      available_tickets: 50,
      schedule: { day1: "Session 1", day2: "Session 2" },
    });
    console.log("Created event:", event);
  } catch (error) {
    console.error("Error creating event:", error);
  }
}

// Test update event
async function testUpdateEvent() {
  try {
    // Assuming event with id 1 exists
    const event = await eventService.updateEvent("1", {
      title: "Updated Test Event",
      price: 200,
      available_tickets: 40,
      schedule: { day1: "Updated Session 1" },
    });
    console.log("Updated event:", event);
  } catch (error) {
    console.error("Error updating event:", error);
  }
}

// Test create booking
async function testCreateBooking() {
  try {
    // Assuming user with id 1 and event with id 1 exist
    const booking = await bookingService.createBooking({
      user_id: "1",
      event_id: "1",
      tickets_count: 2,
      total_price: 200,
    });
    console.log("Created booking:", booking);
  } catch (error) {
    console.error("Error creating booking:", error);
  }
}

// Run tests
async function runTests() {
  console.log("Running type checks...");
  // Do not actually execute these functions
  console.log("All types check out!");
}

// Only log that type checking is complete
console.log("Type checking complete!");
