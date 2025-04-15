import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// S3 client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// S3 bucket name
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "";

/**
 * Generate a presigned URL for uploading a file to S3
 */
export async function getPresignedUploadUrl(
  fileExtension: string,
  contentType: string,
  userId: string
): Promise<{ uploadUrl: string; fileKey: string }> {
  // Validate file extension
  const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  if (!validExtensions.includes(fileExtension.toLowerCase())) {
    throw new Error(
      `Invalid file extension: ${fileExtension}. Allowed: ${validExtensions.join(
        ", "
      )}`
    );
  }

  // Create a unique file key
  const fileKey = `profile-pictures/${userId}/${uuidv4()}${fileExtension}`;

  // Create command for uploading
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  // Generate a presigned URL for upload
  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 15, // URL expires in 15 minutes
  });

  return { uploadUrl, fileKey };
}

/**
 * Generate a presigned URL for viewing a file from S3
 * Note: For public files, you can also use the direct S3 URL
 */
export async function getPresignedViewUrl(fileKey: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  const viewUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 60 * 24, // URL expires in 24 hours
  });

  return viewUrl;
}

/**
 * Get the public URL for a file in S3
 */
export function getPublicS3Url(fileKey: string): string {
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
}

/**
 * Helper to get file extension from a file name or MIME type
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts.pop()}` : "";
}

export function getMimeTypeExtension(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
  };

  return mimeMap[mimeType] || "";
}
