import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { findUserByEmail, findUserById } from "../models/users.js";

const strategy = new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
        try {
            const user = await findUserByEmail(email);
            if (!user || !user.passwordHash || typeof user.passwordHash !== "string") {
                // Case 2: User not found or password incorrect
                return done(null, false, { message: "User or password incorrect"});
            }

            const isValidPassword = await bcrypt.compare(password, user.passwordHash);
            if (!isValidPassword) {
                // Case 2: User not found or password incorrect
                return done(null, false, { message: "User or password incorrect"});
            }

            // Case 3: User found and password correct
            delete user.passwordHash; // Remove password from user object
            return done(null, user);

        } catch (error) {
            return done(error);
        }
    }
);

passport.use(strategy);

// Serialize user to store in session
passport.serializeUser((user, done) => {
    done(null, user._id.toString());
});

// Deserialize user (how to retrieve user from session)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await findUserById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;