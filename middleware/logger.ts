import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import fsPromises from "fs/promises";
import path from "path";
import { getDirname } from "../utils/pathHelper.js";
import type { NextFunction, Request, Response } from "express";

const __dirname = getDirname(import.meta.url);

export const logEvents = async (
  message: string,
  logFileName: string
): Promise<void> => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuidv4()}\t${message}\n`;

  try {
    //ensure the logs directory exists
    await fsPromises.mkdir(path.join(__dirname, "..", "logs"), {
      recursive: true,
    });

    //append the log entry to the file
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (error) {
    console.error((error as Error).message);
  }
};

export const logger = (req: Request, res: Response, next: NextFunction) => {
  //logs every request that comes in
  //Future improvement, maybe add conditionals to only log from certain sources, otherwise this will fill up very fast
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  next();
};
