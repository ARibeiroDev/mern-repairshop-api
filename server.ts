import dotenv from "dotenv";
dotenv.config();
import express, { type Request, type Response } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import type { MongoError } from "mongodb";
import { getDirname } from "./utils/pathHelper.js";
import { logger, logEvents } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { corsOptions } from "./config/corsOptions.js";
import { connectDB } from "./config/dbConn.js";
import rootRoutes from "./routes/root.js";
import userRoutes from "./routes/userRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT;

connectDB();

const __dirname = getDirname(import.meta.url);

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", rootRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/notes", noteRoutes);

app.all("/*splat", (req: Request, res: Response) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({
      message: "404 Not Found",
    });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

//errorHandlers always come last in the middleware order
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err: unknown) => {
  if (err instanceof Error) {
    console.error(err.message);
  }
  const mongoErr = err as Partial<MongoError>;
  logEvents(`${mongoErr.code}\t${mongoErr.message}`, "mongoErrLog.log");
});
