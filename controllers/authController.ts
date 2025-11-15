import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

// @desc Login
// @route POST /auth
// @access Public
interface UserLoginBody {
  username: string;
  password: string;
}

export const login = async (
  req: Request<{}, {}, UserLoginBody>,
  res: Response
): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const match = await bcrypt.compare(password, foundUser?.password);

  if (!match) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const accessSecret = process.env.ACCESS_TOKEN_SECRET;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

  if (!refreshSecret || !accessSecret) {
    res.status(500).json({
      message: "REFRESH_TOKEN_SECRET or ACCESS_TOKEN_SECRET are not defined!",
    });
    return;
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    accessSecret,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      username: foundUser.username,
    },
    refreshSecret,
    { expiresIn: "7d" }
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "none", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  res.json({ accessToken });
};

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const refreshToken = cookies.jwt;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
  const accessSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!refreshSecret || !accessSecret) {
    res.status(500).json({
      message: "REFRESH_TOKEN_SECRET or ACCESS_TOKEN_SECRET are not defined!",
    });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, refreshSecret) as {
      username: string;
    };
    const foundUser = await User.findOne({
      username: decoded.username,
    }).exec();

    if (!foundUser) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: foundUser.roles,
        },
      },
      accessSecret,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Forbidden" });
  }
};

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
export const logout = async (req: Request, res: Response): Promise<void> => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.sendStatus(204); //No content
    return;
  }
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.json({ message: "Cookie cleared" });
};
