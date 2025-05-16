-- CreateTable
CREATE TABLE "bookings" (
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "booking_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "tickets" INTEGER,
    "total_price" INTEGER,
    "status" TEXT,
    "id" UUID NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "image_url" TEXT,
    "price" INTEGER,
    "category" TEXT,
    "duration" TEXT,
    "organizer" TEXT,
    "available_tickets" INTEGER,
    "schedule" JSON,
    "status" TEXT DEFAULT 'active',

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "ticket_code" TEXT,
    "price" INTEGER,
    "issued_date" TIMESTAMP(6),
    "status" TEXT,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "role" TEXT,
    "profile_url" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
