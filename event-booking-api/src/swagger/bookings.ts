/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - user_id
 *         - event_id
 *         - tickets_count
 *         - total_price
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the booking
 *         user_id:
 *           type: string
 *           description: The user ID
 *         event_id:
 *           type: string
 *           description: The event ID
 *         booking_time:
 *           type: string
 *           format: date-time
 *           description: Time of booking
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update time
 *         tickets_count:
 *           type: integer
 *           description: Number of tickets
 *         total_price:
 *           type: integer
 *           description: Total price of the booking
 *         status:
 *           type: string
 *           enum: [CONFIRMED, CANCELLED, PENDING]
 *           description: Booking status
 *       example:
 *         user_id: "1"
 *         event_id: "1"
 *         tickets_count: 2
 *         total_price: 598
 *
 *     Ticket:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the ticket
 *         booking_id:
 *           type: string
 *           description: The booking ID
 *         ticket_code:
 *           type: string
 *           description: Unique ticket code
 *         price:
 *           type: integer
 *           description: Price of the ticket
 *         issued_date:
 *           type: string
 *           format: date-time
 *           description: Date of issue
 *         status:
 *           type: string
 *           enum: [VALID, USED, CANCELLED]
 *           description: Ticket status
 */

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: The Bookings API
 *
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *                     tickets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Not enough tickets or invalid data
 *       401:
 *         description: Unauthorized
 *
 * /api/bookings/user:
 *   get:
 *     summary: Get all bookings for current user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     bookings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Unauthorized
 *
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The booking ID
 *     responses:
 *       200:
 *         description: The booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Booking not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not user's booking
 */
