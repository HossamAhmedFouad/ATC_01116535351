import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler,
} from "express";
import { createClient } from "@supabase/supabase-js";
import multer, { MulterError } from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import { createLogger } from "../utils/logger";

// Define allowed bucket types
type AllowedBucket = "images" | "documents" | "avatars";

// Define request types
interface FileUploadRequest extends Request {
  file?: Express.Multer.File;
  body: {
    bucket?: AllowedBucket;
    folder?: string;
  };
}

interface FileDeleteRequest extends Request {
  body: {
    path: string;
  };
  params: {
    bucket?: AllowedBucket;
  };
}

interface SignedUrlRequest extends Request {
  query: {
    path?: string;
    bucket?: AllowedBucket;
    expiresIn?: string;
  };
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "..", "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueFileName = `${Date.now()}-${uuidv4()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueFileName);
  },
});

// Configure multer upload
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new MulterError(
          "LIMIT_UNEXPECTED_FILE",
          "Invalid file type. Only images are allowed."
        )
      );
    }
  },
});

// Multer error handling middleware
export const handleMulterError: ErrorRequestHandler = (
  err: Error | MulterError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        res
          .status(400)
          .json({ error: "File size limit exceeded (5MB maximum)." });
        return;
      case "LIMIT_UNEXPECTED_FILE":
        res.status(400).json({ error: err.message || "Invalid file type." });
        return;
      default:
        res.status(400).json({ error: "Error uploading file." });
        return;
    }
  }
  next(err);
};

export class AssetsController {
  private logger = createLogger("AssetsController");
  private supabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required"
      );
    }

    this.logger.info("Initializing Supabase client...");
    this.supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  }

  public uploadFile: RequestHandler = async (
    req: FileUploadRequest,
    res: Response
  ): Promise<void> => {
    try {
      const file = req.file;
      const { bucket = "images", folder = "" } = req.body;

      if (!file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const filePath = path.join(folder, file.filename);

      // Read file into buffer instead of using stream
      const fileBuffer = await promisify(fs.readFile)(file.path);

      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .upload(filePath, fileBuffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.mimetype,
        });

      // Clean up the temporary file
      await promisify(fs.unlink)(file.path);

      if (error) {
        this.logger.error("Error uploading file to Supabase:", error);
        res.status(500).json({ error: "Error uploading file to storage" });
        return;
      }

      // Get the signed URL for the uploaded file
      const { data: signedUrlData, error: signedUrlError } =
        await this.supabaseClient.storage
          .from(bucket)
          .createSignedUrl(filePath, 3600);

      if (signedUrlError) {
        this.logger.error("Error generating signed URL:", signedUrlError);
      }

      res.status(201).json({
        ...data,
        path: filePath,
        signedUrl: signedUrlData?.signedUrl,
        publicUrl: `${process.env.SUPABASE_URL}/storage/v1/object/sign/${bucket}/${filePath}`,
      });
    } catch (error) {
      this.logger.error("Error in uploadFile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  public deleteFile: RequestHandler = async (
    req: FileDeleteRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { path: filePath } = req.body;
      const { bucket = "images" } = req.params;

      const { error } = await this.supabaseClient.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        this.logger.error("Error deleting file from Supabase:", error);
        res.status(500).json({ error: "Error deleting file from storage" });
        return;
      }

      res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      this.logger.error("Error in deleteFile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  public getSignedUrl: RequestHandler = async (
    req: SignedUrlRequest,
    res: Response
  ): Promise<void> => {
    try {
      const {
        path: filePath,
        bucket = "images",
        expiresIn = "3600",
      } = req.query;

      if (!filePath) {
        res.status(400).json({ error: "File path is required" });
        return;
      }

      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .createSignedUrl(filePath as string, parseInt(expiresIn as string));

      if (error) {
        this.logger.error("Error generating signed URL:", error);
        res.status(500).json({ error: "Error generating signed URL" });
        return;
      }

      res.status(200).json(data);
    } catch (error) {
      this.logger.error("Error in getSignedUrl:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
