import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ENV } from '../config/env.js';
import fs from 'fs';
import path from 'path';

// Check if credentials and bucket are provided
export const isS3Configured = () => {
  return Boolean(
    ENV.AWS_ACCESS_KEY_ID &&
    ENV.AWS_SECRET_ACCESS_KEY &&
    ENV.AWS_BUCKET_NAME &&
    ENV.AWS_ACCESS_KEY_ID.trim() !== '' &&
    ENV.AWS_SECRET_ACCESS_KEY.trim() !== '' &&
    ENV.AWS_BUCKET_NAME.trim() !== ''
  );
};

// Initialize S3 Client
let s3ClientInstance = null;
export const getS3Client = () => {
  if (!s3ClientInstance && isS3Configured()) {
    s3ClientInstance = new S3Client({
      region: ENV.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: ENV.AWS_ACCESS_KEY_ID,
        secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3ClientInstance;
};

/**
 * Uploads a file buffer directly to AWS S3.
 * If AWS credentials are not yet configured in .env, saves locally as fallback
 * so development doesn't break.
 */
export const uploadFileToS3 = async ({
  fileBuffer,
  fileName,
  mimeType,
  userId,
  subject,
  topic,
  subjectId,
  folderId,
}) => {
  const sanitize = (str) =>
    (str || '')
      .toString()
      .trim()
      .replace(/[\\/?%*:|"<>#]/g, '')
      .replace(/\s+/g, '_') || 'general';

  const userPart = userId || 'unknown';
  const subjectPart = sanitize(subject || (subjectId ? `subject_${subjectId}` : 'general'));
  const topicPart = sanitize(topic || (folderId ? `topic_${folderId}` : 'general'));
  const cleanFileName = (fileName || 'file.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');

  // Exact required format: userid/subject/topic/file.pdf
  const s3Key = `${userPart}/${subjectPart}/${topicPart}/${cleanFileName}`;

  if (isS3Configured()) {
    const client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: ENV.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType || 'application/octet-stream',
    });

    await client.send(command);

    // Standard AWS S3 URL
    const fileUrl = `https://${ENV.AWS_BUCKET_NAME}.s3.${ENV.AWS_REGION}.amazonaws.com/${s3Key}`;

    return {
      s3Key,
      fileUrl,
      isMock: false,
    };
  } else {
    // Graceful fallback for local development before user adds AWS credentials
    console.warn(
      '⚠️ AWS S3 credentials not fully configured in .env. Falling back to local storage.'
    );
    const localUploadsDir = path.resolve('public', 'uploads', `${userPart}`, `${subjectPart}`, `${topicPart}`);
    if (!fs.existsSync(localUploadsDir)) {
      fs.mkdirSync(localUploadsDir, { recursive: true });
    }
    const localFilePath = path.join(localUploadsDir, cleanFileName);
    fs.writeFileSync(localFilePath, fileBuffer);

    const localUrl = `/uploads/${userPart}/${subjectPart}/${topicPart}/${cleanFileName}`;
    return {
      s3Key,
      fileUrl: localUrl,
      isMock: true,
    };
  }
};

/**
 * Generates a presigned URL to securely view or download an S3 object.
 */
export const getS3DownloadUrl = async (s3Key, expiresIn = 3600) => {
  if (!s3Key) return null;

  if (isS3Configured()) {
    try {
      const client = getS3Client();
      const command = new GetObjectCommand({
        Bucket: ENV.AWS_BUCKET_NAME,
        Key: s3Key,
      });
      return await getSignedUrl(client, command, { expiresIn });
    } catch (err) {
      console.error('Error generating S3 presigned URL:', err);
      return null;
    }
  }

  // Fallback if local URL or direct URL
  return null;
};

/**
 * Deletes an object from AWS S3 by its Key.
 */
export const deleteFileFromS3 = async (s3Key) => {
  if (!s3Key) return false;

  if (isS3Configured()) {
    try {
      const client = getS3Client();
      const command = new DeleteObjectCommand({
        Bucket: ENV.AWS_BUCKET_NAME,
        Key: s3Key,
      });
      await client.send(command);
      return true;
    } catch (err) {
      console.error('Error deleting file from S3:', err);
      return false;
    }
  }

  return true;
};
