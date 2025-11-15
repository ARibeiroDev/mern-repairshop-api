import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const URI = process.env.DATABASE_URI;

  if (!URI) {
    throw Error("DATABASE_URI is not defined!");
  }

  try {
    await mongoose.connect(URI);
  } catch (error) {
    console.error("Connection error:", (error as Error).message);
    process.exit(1);
  }
};
