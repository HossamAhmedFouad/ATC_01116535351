import prisma from "../prisma/client";

async function testUUID() {
  try {
    console.log("Creating a test event with UUID...");

    const event = await prisma.events.create({
      data: {
        title: "Test UUID Event",
        date: new Date(),
        location: "Test Location",
        description: "This is a test event to verify UUID generation",
        price: 100,
        category: "Test",
        available_tickets: 50,
      },
    });

    console.log("Event created successfully with UUID:");
    console.log(event);

    // Verify we can retrieve it
    const retrievedEvent = await prisma.events.findUnique({
      where: {
        id: event.id,
      },
    });

    console.log("Retrieved event by UUID:");
    console.log(retrievedEvent);

    // Clean up - delete the test event
    await prisma.events.delete({
      where: {
        id: event.id,
      },
    });

    console.log("Test event deleted successfully.");
  } catch (error) {
    console.error("Error testing UUID functionality:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testUUID()
  .then(() => console.log("UUID test completed"))
  .catch((e) => console.error(e));
