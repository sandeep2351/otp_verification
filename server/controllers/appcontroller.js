import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../config.js";
import otpgenerator from "otp-generator";

// Middleware for user verification
export async function verifyuser(req, res, next) {
    try {
        const { username } = req.method === "GET" ? req.query : req.body;

        // Convert username to lowercase for consistency (case-insensitive login)
        let exist = await User.findOne({ username: username.toLowerCase() });
        if (!exist) return res.status(404).send({ error: "Can't find user" });
        next();
    } catch (error) {
        return res.status(404).send({ error: "Authentication error" });
    }
}

// Register a new user
export async function register(req, res) {
    try {
        const { username, password, profile, email } = req.body;

        // Validate input: Ensure required fields are provided
        if (!username || !password || !email) {
            return res.status(400).json({ error: "Username, password, and email are required." });
        }

        // Convert username and email to lowercase for consistency
        const normalizedUsername = username.toLowerCase();
        const normalizedEmail = email.toLowerCase();

        // Check if the username already exists
        const existingUsername = await User.findOne({ username: normalizedUsername });
        if (existingUsername) {
            return res.status(400).json({ error: "Please use a unique username." });
        }

        // Check if the email already exists
        const existingEmail = await User.findOne({ email: normalizedEmail });
        if (existingEmail) {
            return res.status(400).json({ error: "Please use a unique email." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user object
        const user = new User({
            username: normalizedUsername,
            password: hashedPassword,
            profile: profile || '',
            email: normalizedEmail,
        });

        // Save the user to the database
        const savedUser = await user.save();
        console.log(savedUser);

        // Return a response with the newly registered user's information (excluding the password)
        const { password: _, ...userData } = savedUser.toObject(); // Exclude the password field
        return res.status(201).json({ msg: "User registered successfully", user: userData });
    } catch (error) {
        console.error("Registration error:", error); // Log the error for debugging
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}

// Login user
export async function login(req, res) {
    const { username, password } = req.body;
    console.log("Login Request - Username:", username); // Log username
    try {
        // Normalize username for case-insensitive search
        const normalizedUsername = username.toLowerCase();

        console.log("Normalized Username:", normalizedUsername); // Log normalized username

        // Find user by username
        const user = await User.findOne({ username: normalizedUsername });
        console.log("User Found in Database:", user); // Log user object from database

        if (!user) {
            return res.status(404).send({ error: "Username not found" });
        }

        // Compare the input password with the hashed password
        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) {
            return res.status(400).send({ error: "Password does not match" });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
            },
            env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).send({
            msg: "Login successful!",
            username: user.username,
            token,
        });
    } catch (error) {
        console.error("Login error:", error); // Log the error
        return res.status(500).send({ error: error.message });
    }
}

// Get user details
export async function getuser(req, res) {
    const { username } = req.params;
    console.log("Getting user data for:", username);
  
    try {
        if (!username) {
            return res.status(400).send({ error: "Invalid username" });
        }

        // Normalize username for case-insensitive search
        const normalizedUsername = username.toLowerCase();
  
        const user = await User.findOne({ username: normalizedUsername });
        console.log("User found:", user);
        if (!user) {
            return res.status(404).send({ error: "Couldn't find the user" });
        }

        // Remove password
        const { password, ...rest } = user.toObject();
        return res.status(200).send(rest);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Can't find user data" });
    }
}

// Update user
export async function updateuser(req, res) {
    try {
        const { userId } = req.user; 

        if (userId) {
            const body = req.body;
            const result = await User.updateOne({ _id: userId }, body);
  
            if (result.nModified === 0) {
                return res.status(404).send({ error: "No records updated. User may not exist." });
            }
  
            return res.status(200).send({ msg: "Record updated successfully!" });
        } else {
            return res.status(400).send({ error: "User ID not found" });
        }
    } catch (error) {
        return res.status(500).send({ error: error.message || "An error occurred" });
    }
}

// Generate OTP for password reset
export async function generateOTP(req, res) {
    req.app.locals.OTP = await otpgenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    res.status(201).send({ code: req.app.locals.OTP });
}

// Verify OTP for password reset
export async function verifyOTP(req, res) {
    const { code } = req.query;
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null; // Reset the OTP value
        req.app.locals.resetSession = true; // Start the session for password reset
        return res.status(201).send({ msg: "Verified successfully" });
    }
    return res.status(400).send({ error: "Invalid OTP" });
}

// Create reset session
export async function createresetsession(req, res) {
    if (req.app.locals.resetSession) {
        return res.status(201).send({ flag:req.app.locals.resetSession });
    }
    return res.status(440).send({ error: "Session expired" });
}

// Reset password
export async function resetpassword(req, res) {
    try {
        if (!req.app.locals.resetSession) {
            return res.status(440).send({ error: "Session expired!" });
        }
        const { username, password } = req.body;

        // Normalize username for case-insensitive search
        const normalizedUsername = username.toLowerCase();

        // Find the user by username
        const user = await User.findOne({ username: normalizedUsername });
        if (!user) {
            return res.status(404).send({ error: "Username not found" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password in the database
        const result = await User.updateOne(
            { username: user.username },
            { password: hashedPassword }
        );

        if (result.nModified === 0) {
            return res.status(404).send({ error: "No records updated. User may not exist." });
        }

        return res.status(200).send({ msg: "Password updated successfully!" });
    } catch (error) {
        return res.status(500).send({ error: error.message || "An error occurred" });
    }
}
