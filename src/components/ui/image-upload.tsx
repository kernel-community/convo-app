import type { ChangeEvent } from "react";
import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "./button";

export interface ImageUploadProps {
  userId: string;
  currentImageUrl?: string | null;
  onUploadComplete?: (imageUrl: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ImageUpload({
  userId,
  currentImageUrl,
  onUploadComplete,
  size = "md",
  className = "",
}: ImageUploadProps) {
  // States for the image upload process
  const [image, setImage] = useState<string | null>(currentImageUrl || null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size mapping
  const sizeMap = {
    sm: {
      width: 100,
      height: 100,
      containerClass: "w-[100px] h-[100px]",
    },
    md: {
      width: 150,
      height: 150,
      containerClass: "w-[150px] h-[150px]",
    },
    lg: {
      width: 200,
      height: 200,
      containerClass: "w-[200px] h-[200px]",
    },
  };

  // Handle file selection
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setUploadError(`Invalid file type. Allowed: ${validTypes.join(", ")}`);
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    // Reset previous errors
    setUploadError(null);

    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setShowPreview(true);
    };
    reader.readAsDataURL(selectedFile);
    setFile(selectedFile);
  }, []);

  // Trigger file input click
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file || !userId) return;

    try {
      setUploading(true);
      setUploadError(null);

      // 1. Get a presigned URL for upload
      const presignedResponse = await fetch("/api/profile/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: file.type,
          userId,
        }),
        credentials: "include", // Include cookies for auth
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        const errorMessage = errorData.error || "Failed to get upload URL";

        // Handle unauthorized errors specially
        if (presignedResponse.status === 401) {
          throw new Error("You must be logged in to upload images");
        }

        throw new Error(errorMessage);
      }

      const { uploadUrl, fileKey } = await presignedResponse.json();

      // 2. Upload the file to S3 using the presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      // 3. Update the profile with the new image URL
      const updateResponse = await fetch("/api/profile/update-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          fileKey,
        }),
        credentials: "include", // Include cookies for auth
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error || "Failed to update profile image");
      }

      const result = await updateResponse.json();

      // 4. Call the onUploadComplete callback
      if (onUploadComplete && result.profile.image) {
        onUploadComplete(result.profile.image);
      }

      // Reset the file state
      setFile(null);
      setShowPreview(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setUploading(false);
    }
  };

  // Cancel the upload
  const handleCancel = () => {
    setFile(null);
    setShowPreview(false);
    setUploadError(null);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Preview */}
      <div
        className={`relative mb-4 overflow-hidden rounded-full bg-muted ${sizeMap[size].containerClass} flex items-center justify-center`}
      >
        {image && !showPreview ? (
          <>
            <Image
              src={image}
              alt="Profile picture"
              width={sizeMap[size].width}
              height={sizeMap[size].height}
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100"
              onClick={handleSelectFile}
            >
              <Camera className="h-6 w-6 text-white" />
            </div>
          </>
        ) : showPreview && image ? (
          <>
            <div className="relative h-full w-full">
              <Image
                src={image}
                alt="Preview"
                width={sizeMap[size].width}
                height={sizeMap[size].height}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 rounded-full bg-white p-0"
                      onClick={handleUpload}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 rounded-full bg-white p-0"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center bg-gray-100 hover:bg-gray-200"
            onClick={handleSelectFile}
          >
            <Upload className="h-6 w-6 text-gray-400" />
            <span className="mt-1 text-xs text-gray-500">Upload</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="mt-2 text-center text-sm text-red-500">
          {uploadError}
        </div>
      )}

      {/* Upload Button (only shown when not in preview mode) */}
      {!image && !showPreview && (
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={handleSelectFile}
        >
          Select Image
        </Button>
      )}
    </div>
  );
}
