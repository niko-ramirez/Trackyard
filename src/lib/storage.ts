import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

export type UploadTarget = {
  /** Where the browser should PUT the raw file bytes. */
  uploadUrl: string;
  /** Public URL to read the file back afterward. */
  fileUrl: string;
};

const hasS3Config =
  env.STORAGE_ENDPOINT &&
  env.STORAGE_BUCKET &&
  env.STORAGE_ACCESS_KEY_ID &&
  env.STORAGE_SECRET_ACCESS_KEY &&
  env.STORAGE_PUBLIC_BASE_URL;

/**
 * Returns an upload target for a new object. Backed by R2/S3 when storage
 * credentials are configured, otherwise falls back to writing the file to
 * local disk (via /api/uploads/local) for local development. Callers on the
 * client always just PUT the file to `uploadUrl` — the backing store is an
 * implementation detail.
 */
export async function createUploadTarget(key: string): Promise<UploadTarget> {
  if (hasS3Config) {
    const s3 = new S3Client({
      region: "auto",
      endpoint: env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: env.STORAGE_ACCESS_KEY_ID!,
        secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY!,
      },
    });

    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: env.STORAGE_BUCKET, Key: key }),
      { expiresIn: 60 * 5 },
    );

    return {
      uploadUrl,
      fileUrl: `${env.STORAGE_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${key}`,
    };
  }

  return {
    uploadUrl: `/api/uploads/local?key=${encodeURIComponent(key)}`,
    fileUrl: `/uploads/${key}`,
  };
}
