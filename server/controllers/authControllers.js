const User = require("../models/Users.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



exports.googleRegister = async (req, res) => {
  try {
    const { fullName, email, googleId, photoURL } = req.body;

    let user = await User.findOne({ email });

    // If user already exists → login
    if (user) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login successful",
        token,
        user
      });
    }

    // Generate random password
    const randomPassword = Math.random().toString(36).slice(-10);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(randomPassword, salt);

    user = new User({
      fullName,
      email,
      passwordHash,
      provider: "google",
      googleId,
      photoURL,
      role: "user"
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Google registration successful",
      token,
      user
    });

  } catch (error) {
    console.error("Google register error:", error);
    res.status(500).json({ error: error.message });
  }
};
/*
  EMAIL AND PASSWORD LOGIN
  This function authenticates a user using their email and password.
*/
exports.login = async (req, res) => {
  
  try {
    const { email, password } = req.body;
   

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
   

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, user });

  } catch (error) {
    console.error("Login error:", error); // log the full error
    res.status(500).json({ error: error.message });
  }
};
/*
  REGISTER
  This function allows a new user to create an account using email and password.
*/
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      passwordHash,
      role: "user",  // default role
      provider: "local" // to distinguish from OAuth users
    });

    await newUser.save();

    // Optionally create JWT token immediately after registration
    const token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // Send response
    res.status(201).json({
      message: "Registration successful",
      token: token,
      user: newUser
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
  GOOGLE LOGIN
  This function verifies the Google ID token sent from the frontend.
  If the user does not exist in the database, a new account is created.
*/
exports.googleLogin = async (req, res) => {
  try {

    const { fullName, email, googleId, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({ email });

    // If user does not exist → create
    if (!user) {

      const randomPassword = Math.random().toString(36).slice(-10);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = new User({
        fullName,
        email,
        passwordHash,
        provider: "google",
        googleId,
        photoURL,
        role: "user"
      });

      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token: jwtToken,
      user
    });

  } catch (error) {
    console.error("Google login error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
