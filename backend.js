import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import tripsRouter from "./routes/Trips.js";
import authRouter from "./routes/Auth.js";
import passport from "./config/passport.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
)

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);
app.use("/api", tripsRouter);

app.use("/", express.static("./client/dist"));
app.get("/*splat",  function (req, res) {
  res.sendFile("index.html", {
    root: join(__dirname, "./client/dist"),
  });
});

app.listen(PORT, () =>
  console.log("Unified server running on http://localhost:" + PORT)
);
