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
  console.log("All existing records deleted."); // Create 5 users
  const users = [];

  // Real working profile image URLs
  const profileUrls = [
    "https://randomuser.me/api/portraits/men/1.jpg",
    "https://randomuser.me/api/portraits/women/2.jpg",
    "https://randomuser.me/api/portraits/men/3.jpg",
    "https://randomuser.me/api/portraits/women/4.jpg",
    "https://randomuser.me/api/portraits/men/5.jpg",
  ];

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
        profile_url: profileUrls[i],
      },
    });
    console.log(`Created user with ID: ${user.id}`);
    users.push(user);
  }
  // Create 5 events
  const events = [];
  const categories = [
    "Conference",
    "Workshop",
    "Webinar",
    "Meetup",
    "Concert",
    "Exhibition",
    "Seminar",
    "Retreat",
    "Hackathon",
    "Networking",
    "Festival",
    "Gala",
  ];
  const locations = [
    "New York",
    "San Francisco",
    "London",
    "Tokyo",
    "Sydney",
    "Berlin",
    "Paris",
    "Toronto",
    "Singapore",
    "Dubai",
    "Seoul",
    "Barcelona",
  ];

  // Real working image URLs for events
  const eventImages = [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000",
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=1000",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1000",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1000",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1000",
    "https://images.unsplash.com/photo-1591115765373-5207764f72e4?q=80&w=1000",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000",
    "https://images.unsplash.com/photo-1562329265-95a6d7a83440?q=80&w=1000",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1000",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000",
  ];

  // Real event titles and descriptions
  const eventTitles = [
    "Tech Innovation Summit 2025",
    "Digital Marketing Workshop",
    "AI and Machine Learning Webinar",
    "Developers Meetup",
    "Summer Music Festival 2025",
    "Sustainable Living Exhibition",
    "Leadership & Management Seminar",
    "Mindfulness Wellness Retreat",
    "Global Fintech Hackathon",
    "Creative Industries Networking Night",
    "International Food Festival",
    "Charity Fundraising Gala",
  ];

  const eventDescriptions = [
    "Join industry leaders for our annual Tech Innovation Summit. Network with experts, attend insightful sessions, and discover the latest technological trends shaping our future.",
    "Master the latest digital marketing strategies in this hands-on workshop. Learn SEO, social media marketing, content creation, and analytics from top marketing professionals.",
    "Explore the frontiers of AI and machine learning in this comprehensive webinar. Perfect for beginners and intermediate practitioners looking to enhance their skills.",
    "Connect with fellow developers in your city! Share knowledge, collaborate on projects, and discuss the latest programming languages and frameworks.",
    "Experience the magic of live music at our Summer Festival featuring top artists from around the world. Food, drinks, and unforgettable performances await!",
    "Discover innovative solutions for sustainable living at our eco-friendly exhibition. Explore green technology, renewable energy, waste reduction methods, and much more.",
    "Develop your leadership potential with our intensive seminar featuring renowned business experts. Learn effective management techniques, team building, and strategic thinking.",
    "Escape the daily grind with our rejuvenating wellness retreat. Featuring meditation sessions, yoga classes, nature walks, and nutritional counseling for holistic wellbeing.",
    "Join developers from around the world in this 48-hour hackathon to create innovative fintech solutions. Compete for prizes and connect with industry leaders.",
    "Build valuable connections at our creative industries networking event. Meet professionals from design, media, art, fashion, and advertising in a relaxed atmosphere.",
    "Savor cuisines from around the globe at our international food festival. Featuring cooking demonstrations, tastings, cultural performances, and a vibrant market area.",
    "Support worthy causes at our elegant charity gala. Enjoy fine dining, entertainment, auctions, and make a difference in the lives of those in need.",
  ];

  // Create standard events (the original 5)
  for (let i = 0; i < 5; i++) {
    // Set date to a future date (current date + random days between 10-60)
    const futureDate = new Date();
    futureDate.setDate(
      futureDate.getDate() + Math.floor(Math.random() * 50) + 10
    );

    const event = await prisma.events.create({
      data: {
        title: eventTitles[i],
        date: futureDate,
        location: locations[i],
        description: eventDescriptions[i],
        image_url: eventImages[i],
        price: (i + 1) * 1000, // Price in cents
        category: categories[i],
        duration: `${i + 1} hour${i !== 0 ? "s" : ""}`,
        organizer: `Organizer ${i + 1}`,
        available_tickets: 100,
        schedule: [
          {
            day: "Day 1",
            events: [
              { time: "08:00 AM", title: "Registration & Welcome Coffee" },
              { time: "09:00 AM", title: "Opening Keynote" },
              { time: "10:30 AM", title: "AI & Machine Learning Panel" },
              { time: "12:00 PM", title: "Lunch Break" },
              { time: "01:30 PM", title: "Cloud Computing Workshop" },
              { time: "03:00 PM", title: "Cybersecurity Trends" },
              { time: "04:30 PM", title: "Networking Session" },
            ],
          },
          {
            day: "Day 2",
            events: [
              { time: "09:00 AM", title: "Future of Web Development" },
              { time: "10:30 AM", title: "Blockchain Innovations" },
              { time: "12:00 PM", title: "Lunch Break" },
              { time: "01:30 PM", title: "Data Science Workshop" },
              { time: "03:00 PM", title: "Closing Keynote" },
              { time: "04:30 PM", title: "Networking & Farewell" },
            ],
          },
        ],
      },
    });
    console.log(`Created event with ID: ${event.id}`);
    events.push(event);
  }

  // Create additional events (7 more events)
  for (let i = 5; i < 12; i++) {
    // Set date to a future date (current date + random days between 10-90)
    const futureDate = new Date();
    futureDate.setDate(
      futureDate.getDate() + Math.floor(Math.random() * 80) + 10
    );

    // Create different schedule templates
    let eventSchedule;

    if (i % 3 === 0) {
      // One-day conference schedule
      eventSchedule = [
        {
          day: "Conference Day",
          events: [
            { time: "09:00 AM", title: "Welcome & Check-in" },
            { time: "10:00 AM", title: "Main Presentation" },
            { time: "12:00 PM", title: "Lunch & Networking" },
            { time: "01:30 PM", title: "Breakout Sessions" },
            { time: "03:30 PM", title: "Panel Discussion" },
            { time: "05:00 PM", title: "Closing Remarks & Reception" },
          ],
        },
      ];
    } else if (i % 3 === 1) {
      // Multi-day festival schedule
      eventSchedule = [
        {
          day: "Day 1",
          events: [
            { time: "12:00 PM", title: "Gates Open" },
            { time: "01:00 PM", title: "Opening Act" },
            { time: "03:00 PM", title: "Featured Artists" },
            { time: "06:00 PM", title: "Headliner Performance" },
            { time: "09:00 PM", title: "Closing Show" },
          ],
        },
        {
          day: "Day 2",
          events: [
            { time: "12:00 PM", title: "Gates Open" },
            { time: "01:30 PM", title: "Special Guest Performance" },
            { time: "04:00 PM", title: "International Artists" },
            { time: "07:00 PM", title: "Main Event" },
            { time: "10:00 PM", title: "Festival Closing" },
          ],
        },
      ];
    } else {
      // Workshop schedule
      eventSchedule = [
        {
          day: "Workshop Day",
          events: [
            { time: "08:30 AM", title: "Registration & Materials" },
            { time: "09:00 AM", title: "Introduction & Overview" },
            { time: "10:30 AM", title: "Hands-on Session I" },
            { time: "12:00 PM", title: "Lunch Break" },
            { time: "01:00 PM", title: "Hands-on Session II" },
            { time: "03:00 PM", title: "Q&A and Discussion" },
            { time: "04:30 PM", title: "Wrap-up & Certificates" },
          ],
        },
      ];
    }

    const event = await prisma.events.create({
      data: {
        title: eventTitles[i],
        date: futureDate,
        location: locations[i],
        description: eventDescriptions[i],
        image_url: eventImages[i],
        price: (Math.floor(Math.random() * 10) + 1) * 500, // Random price between 500-5000 cents
        category: categories[i],
        duration: `${Math.floor(Math.random() * 3) + 1} day${
          i !== 5 ? "s" : ""
        }`,
        organizer: `Organizer ${String.fromCharCode(65 + i - 5)}`, // Organizers A through G
        available_tickets: 50 + Math.floor(Math.random() * 200), // Random ticket count between 50-250
        schedule: eventSchedule,
      },
    });
    console.log(`Created event with ID: ${event.id}`);
    events.push(event);
  }
  // Create 5 bookings (one for each user, each booking for a different event)
  const bookings = [];
  const statuses = [
    "CONFIRMED",
    "PENDING",
    "CANCELLED",
    "COMPLETED",
    "REFUNDED",
  ];

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
    const ticketCode = `TKT-${Math.random()
      .toString(36)
      .substring(2, 11)
      .toUpperCase()}`;
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
