import { Router } from "express";
import * as controller from "../controllers/appcontroller.js";
import Auth, { localvariables } from "../middleware/auth.js";
import registerMail from "../controllers/mailer.js"; // Correctly importing the mailer

const router = Router();

// POST routes
router.post("/register", controller.register); // Register user
router.post("/registerMail", registerMail); // Send registration email
router.post("/authenticate",controller.verifyuser, (req, res) => res.end()); // Placeholder for authentication logic
router.post("/login", controller.verifyuser, controller.login); // Login user

// GET routes
router.get("/user/:username", controller.getuser); // Get user by username
router.get(
  "/generateOTP",
  controller.verifyuser,
  localvariables,
  controller.generateOTP
); // Generate random OTP
router.get("/verifyOTP", controller.verifyuser,controller.verifyOTP); // Verify generated OTP
router.get("/createresetsession", controller.createresetsession); // Reset session variables

// PUT routes
router.put("/updateuser", Auth, controller.updateuser); // Update user profile
router.put("/resetpassword", controller.verifyuser, controller.resetpassword); // Reset user password

export default router;
