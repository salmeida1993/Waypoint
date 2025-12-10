import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";

import { isAuthenticated } from "../middleware/auth.js";
import {
  findUserByEmail,
  createUser,
  findUserById,
  emailExists,
  updateUser,
} from "../models/users.js";

const router = express.Router();

// Make sure we can parse JSON
router.use(express.json());

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: "Invalid input" });
    }

    if (await emailExists(email)) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      name,
      email,
      passwordHash: hashedPassword,
      visitedStates: [],
    });

    req.logIn(user, (err) => {
      if (err) {
        console.error("Error logging in after register:", err);
        return res
          .status(500)
          .json({ message: "Error completing registration" });
      }

      return res.status(201).json({
        message: "User registered successfully",
        user,
      });
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        message: info?.message || "Invalid credentials",
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ user });
    });
  })(req, res, next);
});

/**
 * GET /api/auth/me
 */
router.get("/me", isAuthenticated, async (req, res) => {
  res.json({ user: req.user });
});

/**
 * PATCH /api/auth/me
 * Body: { name?, email? }
 */
router.patch("/me", isAuthenticated, async (req, res) => {
  try {
    const { name, email } = req.body || {};
    const updates = {};

    if (name && name.trim()) updates.name = name.trim();
    if (email && email.trim()) {
      const lowerEmail = email.trim().toLowerCase();
      if (lowerEmail !== req.user.email && (await emailExists(lowerEmail))) {
        return res
          .status(409)
          .json({ message: "Email has already been registered" });
      }
      updates.email = lowerEmail;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No changes provided" });
    }

    const updated = await updateUser(req.user._id, updates);
    res.json({ message: "User updated", user: updated });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
});

/**
 * GET /api/auth/me/visited
 */
router.get("/me/visited", isAuthenticated, async (req, res) => {
  const visitedStates = req.user.visitedStates || [];
  res.json({ visitedStates });
});

/**
 * PUT /api/auth/me/visited
 * Body: { visitedStates: string[] }
 */
router.put("/me/visited", isAuthenticated, async (req, res) => {
  try {
    const { visitedStates } = req.body || {};
    if (!Array.isArray(visitedStates)) {
      return res
        .status(400)
        .json({ message: "visitedStates must be an array of strings" });
    }

    const updated = await updateUser(req.user._id, { visitedStates });
    res.json({ visitedStates: updated.visitedStates || [] });
  } catch (error) {
    console.error("Error updating visited states:", error);
    res.status(500).json({ message: "Error updating visited states" });
  }
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).json({ message: "Error logging out" });
    }
    res.json({ message: "Logout successful" });
  });
});

export default router;
