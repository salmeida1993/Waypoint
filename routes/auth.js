// routes/auth.js
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

// Middleware
router.use(express.json());


// Registration endpoint
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
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashedPassword,
      visitedStates: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    delete user.passwordHash; // Remove password from user object

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login endpoint
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        message: info?.message || "Invalid credentials"
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      const safeUser = { ...user };
      delete safeUser.passwordHash;

      return res.json({ user: safeUser });
    });
  })(req, res, next);
});


// Edit a user
router.patch("/me", isAuthenticated, async (req, res) => {
  try {
    const { name, email } = req.body || {};
    const updateData = {};

    if (!name) {
      return res.status(400).json({ message: "Invalid name" });
    }
    updateData.name = name.trim();

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      if (
        (await emailExists(normalizedEmail)) &&
        normalizedEmail !== req.user.email
      ) {
        return res
          .status(409)
          .json({ message: "Email has already been registered" });
      }
      updateData.email = normalizedEmail;
    }

    await updateUser(req.user._id, updateData);
    const updatedUser = await findUserById(req.user._id);
    delete updatedUser.passwordHash;
    res.status(200).json({ message: "User updated", user: updatedUser });

  } catch (error) {
    return res.status(500).json({ message: "Error updating user" });
  }
});

// Get current user
router.get("/me", isAuthenticated, async (req, res) => {
  delete req.user.passwordHash;
  res.json({ user: req.user });
});

// Logout endpoint
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.json({ message: "Logout successful" });
  });
});

export default router;
