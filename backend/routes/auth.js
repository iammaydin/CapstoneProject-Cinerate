const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");

router.post("/reqToken", async (req, res) => {
  try {
    const tokenUserId = "67be1994ba4db704f89102a0";
    const token = jwt.sign({ id: tokenUserId }, process.env.JWT_SECRET, {
      expiresIn: "3h",
    });
    res.json({ token: token });
  } catch (err) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});

router.get("/validate", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post(
  "/register",
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email")
      .isEmail()
      .withMessage("Invalid email address")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((err) => err.msg),
      });
    }

    try {
      const { fullName, username, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Registration failed",
          errors: ["Email already in use"],
        });
      }

      const user = new User({ fullName, username, email, password });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      };

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(201).json({
        success: true,
        message: "Registration successful",
        token,
        user: userResponse,
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        errors: ["Server error"],
      });
    }
  }
);

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email);

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("Stored password hash:", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);
    console.log("User dtls :", user);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
