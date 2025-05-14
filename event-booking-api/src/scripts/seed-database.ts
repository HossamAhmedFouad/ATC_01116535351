import { PrismaClient } from "../generated/prisma";
import { randomUUID } from "crypto";
import { hashPassword } from "../utils/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seeding...");

  // First, delete all existing records (in reverse order of dependencies)
  console.log("Deleting existing records...");
  await prisma.tickets.deleteMany({});
  await prisma.bookings.deleteMany({});
  await prisma.events.deleteMany({});
  await prisma.users.deleteMany({});
  console.log("All existing records deleted.");
  // Create 5 users
  const users = [];
  for (let i = 0; i < 5; i++) {
    // Hash the password just like in user.service.ts
    const hashedPassword = await hashPassword(`password${i + 1}`);

    const user = await prisma.users.create({
      data: {
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: hashedPassword, // Using proper password hashing
        phone: `123-456-${7890 + i}`,
        location: `City ${i + 1}`,
        bio: `This is the bio for user ${i + 1}`,
        role: i === 0 ? "ADMIN" : "USER", // Matching case with user.service.ts
        profile_url: `https://example.com/profiles/user${i + 1}.jpg`,
      },
    });
    console.log(`Created user with ID: ${user.id}`);
    users.push(user);
  }

  // Create 5 events
  const events = [];
  const categories = ["Conference", "Workshop", "Webinar", "Meetup", "Concert"];
  const locations = ["New York", "San Francisco", "London", "Tokyo", "Sydney"];

  for (let i = 0; i < 5; i++) {
    // Set date to a future date (current date + random days between 10-60)
    const futureDate = new Date();
    futureDate.setDate(
      futureDate.getDate() + Math.floor(Math.random() * 50) + 10
    );

    const event = await prisma.events.create({
      data: {
        title: `Event ${i + 1}`,
        date: futureDate,
        location: locations[i],
        description: `This is the description for event ${
          i + 1
        }. Join us for an amazing experience!`,
        image_url: `https://example.com/events/event${i + 1}.jpg`,
        price: (i + 1) * 1000, // Price in cents
        category: categories[i],
        duration: `${i + 1} hour${i !== 0 ? "s" : ""}`,
        organizer: `Organizer ${i + 1}`,
        available_tickets: 100,
        schedule: {
          sessions: [
            { time: "09:00 AM", title: "Registration" },
            { time: "10:00 AM", title: "Opening Keynote" },
            { time: "11:30 AM", title: "Break" },
            { time: "12:00 PM", title: "Main Session" },
          ],
        },
      },
    });
    console.log(`Created event with ID: ${event.id}`);
    events.push(event);
  }

  // Create 5 bookings (one for each user, each booking for a different event)
  const bookings = [];
  const statuses = ["confirmed", "pending", "canceled", "paid", "refunded"];

  for (let i = 0; i < 5; i++) {
    const ticketsCount = Math.floor(Math.random() * 3) + 1; // 1-3 tickets
    const event = events[i];
    const price = event.price || 0;

    const booking = await prisma.bookings.create({
      data: {
        user_id: users[i].id,
        event_id: event.id,
        booking_time: new Date(),
        updated_at: new Date(),
        tickets_count: ticketsCount,
        total_price: price * ticketsCount,
        status: statuses[i],
      },
    });
    console.log(`Created booking with ID: ${booking.id}`);
    bookings.push(booking);
  }

  // Create 5 tickets (linked to the bookings)
  for (let i = 0; i < 5; i++) {
    const ticketCode = `TICKET-${randomUUID().substring(0, 8).toUpperCase()}`;
    const booking = bookings[i];
    const event = events.find((e) => e.id === booking.event_id);

    const ticket = await prisma.tickets.create({
      data: {
        booking_id: booking.id,
        ticket_code: ticketCode,
        price: event?.price || 0,
        issued_date: new Date(),
        status: booking.status,
      },
    });
    console.log(`Created ticket with ID: ${ticket.id}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
