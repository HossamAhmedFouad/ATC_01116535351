/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: API endpoints for managing assets (file uploads)
 */

/**
 * @swagger
 * /api/assets/upload:
 *   post:
 *     summary: Upload a file to Supabase storage
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: The file to upload
 *       - in: formData
 *         name: bucket
 *         type: string
 *         required: false
 *         default: images
 *         description: The storage bucket name
 *       - in: formData
 *         name: folder
 *         type: string
 *         required: false
 *         description: Optional folder path within the bucket
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 path:
 *                   type: string
 *                   example: folder/image.jpg
 *                 key:
 *                   type: string
 *                   example: folder/image.jpg
 *                 url:
 *                   type: string
 *                   example: https://your-project.supabase.co/storage/v1/object/public/images/folder/image.jpg
 *       400:
 *         description: Bad request, missing file or invalid parameters
 *       401:
 *         description: Unauthorized, authentication required
 *       500:
 *         description: Internal server error
 *
 * /api/assets/{bucket}:
 *   delete:
 *     summary: Delete a file from Supabase storage
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bucket
 *         schema:
 *           type: string
 *         required: true
 *         description: The storage bucket name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *             properties:
 *               path:
 *                 type: string
 *                 description: The path of the file to delete
 *                 example: folder/image.jpg
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: File deleted successfully
 *                 deletedFiles:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request, missing path
 *       401:
 *         description: Unauthorized, authentication required
 *       403:
 *         description: Forbidden, admin role required
 *       500:
 *         description: Internal server error
 *
 * /api/assets/signed-url:
 *   get:
 *     summary: Get a signed URL for a file in Supabase storage
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: path
 *         schema:
 *           type: string
 *         required: true
 *         description: The path of the file
 *       - in: query
 *         name: bucket
 *         schema:
 *           type: string
 *         required: false
 *         default: images
 *         description: The storage bucket name
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: string
 *         required: false
 *         default: 3600
 *         description: Expiration time in seconds
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: https://your-project.supabase.co/storage/v1/object/sign/images/folder/image.jpg?token=...
 *       400:
 *         description: Bad request, missing path
 *       401:
 *         description: Unauthorized, authentication required
 *       500:
 *         description: Internal server error
 */
