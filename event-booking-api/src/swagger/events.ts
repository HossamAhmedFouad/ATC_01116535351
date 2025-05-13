/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - date
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the event
 *         title:
 *           type: string
 *           description: The event title
 *         date:
 *           type: string
 *           format: date-time
 *           description: The event date and time
 *         location:
 *           type: string
 *           description: The event location
 *         description:
 *           type: string
 *           description: The event description
 *         image_url:
 *           type: string
 *           description: Event image URL
 *         price:
 *           type: integer
 *           description: Event price
 *         category:
 *           type: string
 *           description: Event category
 *         duration:
 *           type: string
 *           description: Event duration
 *         organizer:
 *           type: string
 *           description: Event organizer
 *         available_tickets:
 *           type: integer
 *           description: Number of available tickets
 *         schedule:
 *           type: object
 *           description: Event schedule (JSON)
 *       example:
 *         title: "Tech Conference 2025"
 *         date: "2025-09-15T10:00:00.000Z"
 *         location: "Convention Center, San Francisco"
 *         description: "Annual technology conference"
 *         price: 299
 *         category: "Technology"
 *         duration: "8 hours"
 *         organizer: "Tech Events Inc."
 *         available_tickets: 500
 *         schedule:
 *           morning:
 *             - {time: "10:00 AM", activity: "Registration"}
 *             - {time: "11:00 AM", activity: "Keynote"}
 *           afternoon:
 *             - {time: "1:00 PM", activity: "Breakout Sessions"}
 */

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: The Events API
 *
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter events by category
 *     responses:
 *       200:
 *         description: List of events
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: The created event
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
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *
 * /api/events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The event ID
 *     responses:
 *       200:
 *         description: The event
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
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 */
