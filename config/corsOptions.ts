import type { CorsOptions } from "cors";
import { allowedOrigins } from "./allowedOrigins.js";

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // For production, remove !origin to restrict API access to frontend only.
    if (allowedOrigins.indexOf(origin as string) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
