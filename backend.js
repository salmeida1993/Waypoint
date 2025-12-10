import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import dotenvx from "@dotenvx/dotenvx";

import "./config/passport.js"; // Important: load Passport strategies
import authRouter from "./routes/auth.js";
import tripsRouter from "./routes/trips.js";

dotenvx.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI environment variable not set");
}

const app = express();

// Parse JSON and form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions (stored in MongoDB)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: process.env.MONGO_DB, // optional, can be undefined if you use DB in URI
    }),
    cookie: {
      httpOnly: true,
      secure: false, // set to true only when using HTTPS in production
      sameSite: "lax",
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// API routes
app.use("/api/auth", authRouter);
app.use("/api/trips", tripsRouter);

// Static React build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "dist")));

// Catch-all for React Router (use RegExp to avoid path-to-regexp crash)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Unified server running on http://localhost:${PORT}`);
});
