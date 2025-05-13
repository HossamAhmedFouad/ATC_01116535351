# Known Issues and Resolutions

This document outlines common issues encountered during development and their solutions.

## BigInt Serialization

When working with BigInt fields from PostgreSQL, you need to handle JSON serialization:

```typescript
// Add this to your main application entry point
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
```

## Handling JSON Fields in Prisma

When working with PostgreSQL JSON fields via Prisma, use the following pattern:

```typescript
// For creating records with JSON fields
const data = {
  // ...other fields
  jsonField: theJsonObject as any, // Cast to any to handle Prisma's JSON type
};

// For querying JSON fields
const result = await prisma.yourModel.findMany({
  where: {
    // Use Prisma's JSON query operators
    jsonField: {
      path: ["key"],
      equals: "value",
    },
  },
});
```

## Null Handling for Numeric Fields

When working with potentially null numeric fields:

```typescript
// Use the nullish coalescing operator
const safeValue = potentiallyNullValue ?? defaultValue;

// Example with BigInt
available_tickets: (event.available_tickets ?? BigInt(0)) -
  BigInt(ticketsCount);
```

## Date Handling

When accepting dates from API requests:

```typescript
// Ensure date is properly formatted
date: eventData.date instanceof Date
  ? eventData.date
  : new Date(eventData.date);
```

## Database Schema Adjustments

When dealing with naming conflicts in the database schema:

```prisma
model bookings {
  // Use @map to handle database field name that conflicts with a relation
  tickets_count BigInt? @map("tickets")
  ticket_items tickets[] // Relation field
}
```
