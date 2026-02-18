import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "3001"),
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: parseInt(process.env.DB_PORT || "5432"),
  DB_NAME: process.env.DB_NAME || "stokku",
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  JWT_SECRET: process.env.JWT_SECRET || "stokku-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  MODEL_ID: process.env.MODEL_ID,
};
