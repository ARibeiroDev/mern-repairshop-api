import express, { type Request, type Response } from "express";
import path from "path";
import { getDirname } from "../utils/pathHelper.js";

const router = express.Router();

const __dirname = getDirname(import.meta.url);

router.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

router.get("/index{.html}", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

export default router;
