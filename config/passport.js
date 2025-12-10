import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { findUserByEmailWithPassword, findUserById } from "../models/users.js";

// Local strategy for email + password
const strategy = new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  async (email, password, done) => {
    try {
      const user = await findUserByEmailWithPassword(email);

      if (
        !user ||
        !user.passwordHash ||
        typeof user.passwordHash !== "string"
      ) {
        return done(null, false, { message: "User or password incorrect" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return done(null, false, { message: "User or password incorrect" });
      }

      // Don't expose passwordHash further
      const { passwordHash, ...rest } = user;
      return done(null, rest);
    } catch (error) {
      console.error("Error in LocalStrategy:", error);
      return done(error);
    }
  }
);

passport.use(strategy);

// Serialize user into session (store ID)
passport.serializeUser((user, done) => {
  done(null, user._id.toString());
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
