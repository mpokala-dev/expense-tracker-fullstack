import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { config } from "../config/env";
import type { JwtPayload } from "../types/index";

// Services contain business logic and are tested independently of Express.
// They know nothing about req/res — that's the controller's job.

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new Error("DUPLICATE_EMAIL");
  }

  // bcrypt cost factor of 12 — slow enough to resist brute-force,
  // fast enough for a login endpoint (~300ms on modern hardware)
  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });

  const token = signToken({ userId: user._id.toString(), email: user.email });

  return {
    token,
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  // Always fetch the user including password for comparison
  const user = await User.findOne({ email: input.email }).select("+password");

  // Use the same error message for "not found" and "wrong password"
  // to avoid user enumeration attacks
  const invalidCredentials = new Error("INVALID_CREDENTIALS");

  if (!user) throw invalidCredentials;

  const passwordMatch = await bcrypt.compare(input.password, user.password);
  if (!passwordMatch) throw invalidCredentials;

  const token = signToken({ userId: user._id.toString(), email: user.email });

  return {
    token,
    user: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}
