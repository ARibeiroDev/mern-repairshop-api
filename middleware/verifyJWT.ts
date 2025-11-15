import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// What the decoded token should look like
interface DecodedToken {
  UserInfo: {
    username: string;
    roles: string[];
  };
  iat: number;
  exp: number;
}

// Extend Express Request
interface CustomRequest extends Request {
  user?: string;
  roles?: string[];
}

export const verifyJWT = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  let authHeader = req.headers.authorization || req.headers.Authorization;

  // Handle if it's an array
  if (Array.isArray(authHeader)) {
    authHeader = authHeader[0];
  }

  // Make sure it's a string and starts with "Bearer "
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Extract token safely
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    res.status(500).json({ message: "ACCESS_TOKEN_SECRET not defined" });
    return;
  }

  // Verify asynchronously
  jwt.verify(token, secret, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    const { UserInfo } = decoded as DecodedToken;

    req.user = UserInfo.username;
    req.roles = UserInfo.roles;

    next();
  });
};
