import { NextRequest, NextResponse } from "next/server";
import { getPresignedUploadUrl, getMimeTypeExtension } from "src/utils/s3";
import { prisma } from "src/utils/db";

// Session cookie name used in your application
const SESSION_COOKIE = "session";

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated by verifying session cookie
    const sessionCookie = req.cookies.get(SESSION_COOKIE);
    const isAuthenticated = !!sessionCookie?.value;

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user session
    const session = await req.json();
    const { contentType, userId } = session;

    // Validate request
    if (!contentType || !userId) {
      return NextResponse.json(
        { error: "Missing contentType or userId" },
        { status: 400 }
      );
    }

    // Validate content type
    const validContentTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validContentTypes.includes(contentType)) {
      return NextResponse.json(
        {
          error: `Invalid content type: ${contentType}. Allowed: ${validContentTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Get file extension from content type
    const fileExtension = getMimeTypeExtension(contentType);
    if (!fileExtension) {
      return NextResponse.json(
        { error: "Could not determine file extension from content type" },
        { status: 400 }
      );
    }

    // Generate presigned URL
    const { uploadUrl, fileKey } = await getPresignedUploadUrl(
      fileExtension,
      contentType,
      userId
    );

    return NextResponse.json({
      uploadUrl,
      fileKey,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
