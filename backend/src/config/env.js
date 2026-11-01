import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 8000,
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATABASE_URL_POOLED: process.env.DATABASE_URL_POOLED || "",
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",
  // AWS S3 Configuration
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET || "",
};

export const {
  PORT,
  DATABASE_URL,
  DATABASE_URL_POOLED,
  JWT_SECRET,
  FRONTEND_URL,
  NODE_ENV,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME,
} = ENV;

export default ENV;