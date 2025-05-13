/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         username:
 *           type: string
 *           description: The username
 *         email:
 *           type: string
 *           description: The user email
 *         password:
 *           type: string
 *           description: The user password (hashed)
 *         phone:
 *           type: string
 *           description: User phone number
 *         location:
 *           type: string
 *           description: User location
 *         bio:
 *           type: string
 *           description: User biography
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *           description: User role
 *         profile_url:
 *           type: string
 *           description: URL to user profile image
 *       example:
 *         username: johndoe
 *         email: john@example.com
 *         password: securepassword123
 *         phone: '+1234567890'
 *         location: 'New York, USA'
 *         bio: 'Event enthusiast'
 *         role: 'USER'
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         location:
 *           type: string
 *         bio:
 *           type: string
 *         role:
 *           type: string
 *         profile_url:
 *           type: string
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *       example:
 *         email: john@example.com
 *         password: securepassword123
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         token:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/UserResponse'
 */
